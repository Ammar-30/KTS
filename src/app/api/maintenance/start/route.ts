/**
 * Start maintenance work
 * POST /api/maintenance/start
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireTransport } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { z } from "zod";
import { maintenanceService } from "@/services";
import { logger } from "@/lib/logger";

const startSchema = z.object({
  requestId: z.string().cuid(),
});

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireTransport(req as any);

  const input = await validateBody(startSchema)(req);

  const request = await maintenanceService.startMaintenance(input.requestId, session);

  logger.info({ requestId: request.id, userId: session.sub }, "Maintenance started");

  const url = new URL("/transport/maintenance", req.url);
  url.searchParams.set("notice", "Maintenance work started");
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
