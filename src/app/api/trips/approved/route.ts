/**
 * Get approved trip requests
 * GET /api/trips/approved
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireTransport } from "@/middleware/rbac";
import { tripRepository } from "@/repositories";
import { TRIP_STATUS } from "@/lib/constants";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireTransport(req as any);

  const items = await tripRepository.findByStatus(TRIP_STATUS.MANAGER_APPROVED);

  return NextResponse.json({ items });
}

export const GET = withErrorHandler(handler);
