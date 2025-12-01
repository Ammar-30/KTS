/**
 * Approve or reject maintenance request
 * POST /api/maintenance/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireManager } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { approveMaintenanceSchema } from "@/validators/maintenance.validator";
import { maintenanceService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireManager(req as any);

  const input = await validateBody(approveMaintenanceSchema)(req);

  const request = await maintenanceService.approveMaintenance(input, session);

  logger.info(
    { requestId: request.id, decision: input.decision, userId: session.sub },
    "Maintenance approved/rejected"
  );

  const msg = input.decision === "approve" ? "Maintenance request approved" : "Maintenance request rejected";
  const url = new URL("/manager/maintenance", req.url);
  url.searchParams.set("notice", msg);
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
