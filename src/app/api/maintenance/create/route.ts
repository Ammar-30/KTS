/**
 * Create maintenance request
 * POST /api/maintenance/create
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireEmployee } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { createMaintenanceSchema } from "@/validators/maintenance.validator";
import { maintenanceService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireEmployee(req as any);

  const input = await validateBody(createMaintenanceSchema)(req);

  const request = await maintenanceService.createMaintenance(input, session.sub);

  logger.info({ requestId: request.id, userId: session.sub }, "Maintenance request created");

  const url = new URL("/employee/maintenance", req.url);
  url.searchParams.set("notice", "Maintenance request submitted");
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
