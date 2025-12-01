/**
 * Create fleet vehicle maintenance request (Transport only)
 * POST /api/maintenance/create-fleet
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireTransport } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { createFleetMaintenanceSchema } from "@/validators/maintenance.validator";
import { maintenanceService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireTransport(req as any);

  const input = await validateBody(createFleetMaintenanceSchema)(req);

  const request = await maintenanceService.createFleetMaintenance(input, session.sub);

  logger.info({ requestId: request.id, userId: session.sub }, "Fleet vehicle maintenance request created");

  const url = new URL("/transport/maintenance", req.url);
  url.searchParams.set("notice", "Fleet vehicle maintenance request submitted");
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);




