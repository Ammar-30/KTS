/**
 * Approve or reject trip request
 * POST /api/trips/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireManager } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { approveTripSchema } from "@/validators/trip.validator";
import { tripService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  // Auth & RBAC
  const { session } = await requireAuth(req);
  requireManager(req as any);

  // Validate input
  const input = await validateBody(approveTripSchema)(req);

  // Approve/reject trip
  const trip = await tripService.approveTrip(input, session);

  logger.info(
    { tripId: trip.id, decision: input.decision, userId: session.sub },
    "Trip approved/rejected"
  );

  // Handle response format
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json");

  if (wantsJson) {
    return NextResponse.json({ ok: true, status: trip.status });
  }

  // Redirect for form submissions
  const url = new URL("/manager", req.url);
  url.searchParams.set(
    "notice",
    input.decision === "approve" ? "Request approved" : "Request rejected"
  );
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
