/**
 * Get user's trips
 * GET /api/trips/my
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireEmployee } from "@/middleware/rbac";
import { validateQuery } from "@/middleware/validate";
import { z } from "zod";
import { tripRepository } from "@/repositories";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.string().optional(),
});

async function handler(req: NextRequest) {
  const { session } = await requireAuth(req);
  requireEmployee(req as any);

  const query = validateQuery(querySchema)(req);
  const result = await tripRepository.findByRequester(session.sub, {
    page: query.page,
    limit: query.limit,
    status: query.status as any,
  });

  return NextResponse.json(result);
}

export const GET = withErrorHandler(handler);
