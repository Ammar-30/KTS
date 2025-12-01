/**
 * Get pending trip requests
 * GET /api/trips/pending
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireManager } from "@/middleware/rbac";
import { tripRepository } from "@/repositories";
import { TRIP_STATUS } from "@/lib/constants";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireManager(req as any);

  const items = await tripRepository.findByStatus(TRIP_STATUS.REQUESTED);

  return NextResponse.json({ items });
}

export const GET = withErrorHandler(handler);
