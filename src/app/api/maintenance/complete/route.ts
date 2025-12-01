/**
 * Complete maintenance
 * POST /api/maintenance/complete
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireTransport } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { completeMaintenanceSchema } from "@/validators/maintenance.validator";
import { maintenanceService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireTransport(req as any);

  const input = await validateBody(completeMaintenanceSchema)(req);

  const request = await maintenanceService.completeMaintenance(input, session);

  logger.info({ requestId: request.id, userId: session.sub }, "Maintenance completed");

  const url = new URL("/transport/maintenance", req.url);
  url.searchParams.set("notice", "Maintenance marked as complete");
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
