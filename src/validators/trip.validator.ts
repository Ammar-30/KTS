/**
 * Zod schemas for trip validation
 */

import { z } from "zod";
import { COMPANIES, VEHICLE_CATEGORY, TRIP_STATUS } from "@/lib/constants";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

/**
 * Sanitize HTML strings
 */
function sanitizeHtml(value: string): string {
  return purify.sanitize(value, { ALLOWED_TAGS: [] }); // Strip all HTML
}

/**
 * Sanitize and validate string input
 */
const sanitizedString = z
  .string()
  .min(1)
  .max(500)
  .transform(sanitizeHtml);

const sanitizedLongString = z
  .string()
  .min(1)
  .max(2000)
  .transform(sanitizeHtml);

export const createTripSchema = z
  .object({
    purpose: sanitizedString,
    fromLoc: sanitizedString,
    toLoc: sanitizedString,
    fromTime: z.coerce.date().refine((date) => date > new Date(), {
      message: "Start time must be in the future",
    }),
    toTime: z.coerce.date(),
    company: z.enum([
      COMPANIES.KIPS_PREPS,
      COMPANIES.TETB,
      COMPANIES.QUALITY_BRANDS,
      COMPANIES.KDP,
    ]),
    department: z.string().max(100).optional().nullable(),
    stops: z.string().max(1000).optional().nullable(),
    vehicleCategory: z.enum([
      VEHICLE_CATEGORY.FLEET,
      VEHICLE_CATEGORY.PERSONAL,
      VEHICLE_CATEGORY.ENTITLED,
    ]),
    personalVehicleDetails: z.string().max(500).optional().nullable(),
    entitledVehicleId: z.string().cuid().optional().nullable(),
    passengerNames: z.string().max(500).optional().nullable(),
  })
  .refine((data) => data.toTime >= data.fromTime, {
    message: "End time must be after start time",
    path: ["toTime"],
  })
  .refine(
    (data) => {
      if (data.vehicleCategory === VEHICLE_CATEGORY.PERSONAL) {
        return !!data.personalVehicleDetails;
      }
      return true;
    },
    {
      message: "Personal vehicle details are required for personal vehicles",
      path: ["personalVehicleDetails"],
    }
  )
  .refine(
    (data) => {
      if (data.vehicleCategory === VEHICLE_CATEGORY.ENTITLED) {
        return !!data.entitledVehicleId;
      }
      return true;
    },
    {
      message: "Entitled vehicle selection is required",
      path: ["entitledVehicleId"],
    }
  );

export const approveTripSchema = z.object({
  tripId: z.string().cuid(),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional().nullable(),
});

export const assignTripSchema = z.object({
  tripId: z.string().cuid(),
  driverId: z.string().cuid(),
  vehicleId: z.string().cuid(),
  startMileage: z.coerce.number().int().min(0),
});

export const cancelTripSchema = z.object({
  tripId: z.string().cuid(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type ApproveTripInput = z.infer<typeof approveTripSchema>;
export type AssignTripInput = z.infer<typeof assignTripSchema>;
export type CancelTripInput = z.infer<typeof cancelTripSchema>;

