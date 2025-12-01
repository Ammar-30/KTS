/**
 * User login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { validateBody } from "@/middleware/validate";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { signSession, setSessionCookie } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function handler(req: NextRequest) {
  const { email, password } = await validateBody(loginSchema)(req);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true, role: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Validate role
  if (!Object.values(ROLES).includes(user.role as any)) {
    logger.error({ userId: user.id, role: user.role }, "Invalid role in database");
    throw new ValidationError("Invalid role configured for user");
  }

  const token = await signSession({
    sub: user.id,
    name: user.name || user.email,
    email: user.email,
    role: user.role as any,
  });

  await setSessionCookie(token);

  logger.info({ userId: user.id, email: user.email }, "User logged in");

  return NextResponse.json({ role: user.role });
}

export const POST = withErrorHandler(handler);
