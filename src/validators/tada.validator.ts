/**
 * Zod schemas for TADA validation
 */

import { z } from "zod";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

function sanitizeHtml(value: string): string {
  return purify.sanitize(value, { ALLOWED_TAGS: [] });
}

const sanitizedString = z
  .string()
  .min(1)
  .max(500)
  .transform(sanitizeHtml);

export const createTadaSchema = z.object({
  tripId: z.string().cuid(),
  claimType: z.enum(["Fuel", "Lunch", "Toll", "Parking", "Other"]),
  amount: z.coerce.number().positive().max(1000000), // Max 1 million
  description: sanitizedString,
});

export const createTadaBatchSchema = z.object({
  tripId: z.string().cuid(),
  claims: z.array(z.object({
    claimType: z.enum(["Fuel", "Lunch", "Toll", "Parking", "Other"]),
    amount: z.coerce.number().positive().max(1000000),
    description: sanitizedString,
  })).min(1).max(10), // Limit to 10 claims per batch
});

export const approveTadaSchema = z.object({
  requestId: z.string().cuid(),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional().nullable(),
});

export type CreateTadaInput = z.infer<typeof createTadaSchema>;
export type ApproveTadaInput = z.infer<typeof approveTadaSchema>;

