/**
 * Authentication middleware
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession, requireSession } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { SessionPayload } from "@/types/api.types";

export interface AuthenticatedRequest extends NextRequest {
  session: SessionPayload;
}

/**
 * Middleware to require authentication
 * Adds session to request object
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ session: SessionPayload; req: AuthenticatedRequest }> {
  const session = await requireSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  (req as AuthenticatedRequest).session = session;
  return { session, req: req as AuthenticatedRequest };
}

/**
 * Middleware to optionally get session (doesn't throw if missing)
 */
export async function getAuth(
  req: NextRequest
): Promise<{ session: SessionPayload | null; req: NextRequest }> {
  const session = await getSession();
  return { session, req };
}




