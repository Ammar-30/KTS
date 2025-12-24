/**
 * Global error handler middleware
 */

import { NextRequest, NextResponse } from "next/server";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ApiError } from "@/types/api.types";

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: unknown, req: NextRequest): NextResponse<ApiError> {
  // Log error with context
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method,
    },
    "Request error"
  );

  // Handle known errors
  if (error instanceof ValidationError) {
    return NextResponse.json<ApiError>(
      {
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof ConflictError
  ) {
    return NextResponse.json<ApiError>(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json<ApiError>(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : "Internal server error";
  logger.error({ error }, "Unhandled error");

  return NextResponse.json<ApiError>(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: process.env.NODE_ENV === "production" 
          ? "An unexpected error occurred" 
          : message,
      },
    },
    { status: 500 }
  );
}

/**
 * Wrapper for route handlers to catch errors
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleError(error, req);
    }
  };
}





