/**
 * Create trip request
 * POST /api/trips/create
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireEmployee } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { createTripSchema } from "@/validators/trip.validator";
import { tripService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  // Auth & RBAC
  const { session } = await requireAuth(req);
  requireEmployee(req as any);

  // Validate input
  const input = await validateBody(createTripSchema)(req);

  // Create trip
  const trip = await tripService.createTrip(input, session.sub);

  logger.info({ tripId: trip.id, userId: session.sub }, "Trip created");

  // Handle response format (JSON or redirect)
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json");

  if (wantsJson) {
    return NextResponse.json({ ok: true, id: trip.id });
  }

  // Redirect for form submissions
  const url = new URL("/employee", req.url);
  url.searchParams.set("ok", "1");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
