/**
 * Cancel trip request
 * POST /api/trips/cancel
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { validateBody } from "@/middleware/validate";
import { cancelTripSchema } from "@/validators/trip.validator";
import { tripService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  const input = await validateBody(cancelTripSchema)(req);

  const trip = await tripService.cancelTrip(input.tripId, session);

  logger.info({ tripId: trip.id, userId: session.sub }, "Trip cancelled");

  const contentType = req.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json");

  if (wantsJson) {
    return NextResponse.json({ ok: true });
  }

  // Redirect
  const url = new URL(session.role === "EMPLOYEE" ? "/employee" : "/transport", req.url);
  url.searchParams.set("ok", "cancelled");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
