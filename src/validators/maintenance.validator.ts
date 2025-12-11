/**
 * Zod schemas for maintenance validation
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
  .max(2000)
  .transform(sanitizeHtml);

export const createMaintenanceSchema = z.object({
  entitledVehicleId: z.string().cuid(),
  description: sanitizedString,
});

export const createFleetMaintenanceSchema = z.object({
  vehicleId: z.string().cuid(),
  description: sanitizedString,
});

export const approveMaintenanceSchema = z.object({
  requestId: z.string().cuid(),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional().nullable(),
});

export const completeMaintenanceSchema = z.object({
  requestId: z.string().cuid(),
  cost: z.coerce.number().nonnegative().max(10000000).optional().nullable(), // Max 10 million
});

export const reportIssueSchema = z.object({
  requestId: z.string().cuid(),
  issueDescription: sanitizedString,
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CreateFleetMaintenanceInput = z.infer<typeof createFleetMaintenanceSchema>;
export type ApproveMaintenanceInput = z.infer<typeof approveMaintenanceSchema>;
export type CompleteMaintenanceInput = z.infer<typeof completeMaintenanceSchema>;
export type ReportIssueInput = z.infer<typeof reportIssueSchema>;

