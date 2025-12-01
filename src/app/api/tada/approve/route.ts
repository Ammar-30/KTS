/**
 * Approve or reject TADA request
 * POST /api/tada/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireManager } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { approveTadaSchema } from "@/validators/tada.validator";
import { tadaService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireManager(req as any);

  const input = await validateBody(approveTadaSchema)(req);

  const tadaRequest = await tadaService.approveTada(input, session);

  logger.info(
    { tadaId: tadaRequest.id, decision: input.decision, userId: session.sub },
    "TADA approved/rejected"
  );

  const msg = input.decision === "approve" ? "Claim approved" : "Claim rejected";
  const url = new URL("/manager/allowances", req.url);
  url.searchParams.set("notice", msg);
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
