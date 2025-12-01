/**
 * Create TADA request
 * POST /api/tada/create
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireEmployee } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { createTadaSchema } from "@/validators/tada.validator";
import { tadaService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireEmployee(req as any);

  const input = await validateBody(createTadaSchema)(req);

  const tadaRequest = await tadaService.createTada(input, session.sub);

  logger.info({ tadaId: tadaRequest.id, userId: session.sub }, "TADA request created");

  const url = new URL("/employee/allowances", req.url);
  url.searchParams.set("notice", "Claim submitted successfully");
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
