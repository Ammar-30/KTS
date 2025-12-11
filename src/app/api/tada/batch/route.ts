/**
 * Create multiple TADA requests in a batch
 * POST /api/tada/batch
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireEmployee } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { createTadaBatchSchema } from "@/validators/tada.validator";
import { tadaService } from "@/services";
import { logger } from "@/lib/logger";

async function handler(req: NextRequest) {
    const { session } = await requireAuth(req);
    requireEmployee(req as any);

    const input = await validateBody(createTadaBatchSchema)(req);

    const result = await tadaService.createTadaBatch(input, session.sub);

    logger.info({
        tripId: input.tripId,
        userId: session.sub,
        count: result.count
    }, "Batch TADA requests created");

    return NextResponse.json({
        success: true,
        message: `${result.count} claims submitted successfully`,
        data: result
    });
}

export const POST = withErrorHandler(handler);
