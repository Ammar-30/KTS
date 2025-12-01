/**
 * Request validation middleware
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/lib/errors";
import { ApiError } from "@/types/api.types";

/**
 * Parse request body (supports both JSON and FormData)
 */
export async function parseBody(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }
  
  const formData = await req.formData();
  return Object.fromEntries(formData.entries());
}

/**
 * Validate request body with Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    const body = await parseBody(req);
    
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || [];
        const firstError = issues[0];
        throw new ValidationError(
          firstError?.message || "Validation failed",
          firstError?.path?.[0] as string,
          issues
        );
      }
      throw new ValidationError("Invalid request body");
    }
  };
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest): T => {
    const params = Object.fromEntries(
      new URL(req.url).searchParams.entries()
    );
    
    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || [];
        const firstError = issues[0];
        throw new ValidationError(
          firstError?.message || "Invalid query parameters",
          firstError?.path?.[0] as string,
          issues
        );
      }
      throw new ValidationError("Invalid query parameters");
    }
  };
}

