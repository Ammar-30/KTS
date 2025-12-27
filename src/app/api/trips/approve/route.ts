/**
 * Approve or reject trip request
 * POST /api/trips/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/middleware/error-handler";
import { requireAuth } from "@/middleware/auth";
import { requireManager } from "@/middleware/rbac";
import { validateBody } from "@/middleware/validate";
import { approveTripSchema } from "@/validators/trip.validator";
import { tripService } from "@/services";
import { logger } from "@/lib/logger";
import { sendAssignmentEmail } from "@/lib/email";
import { TRIP_STATUS } from "@/lib/constants";

function fmt(dt: Date | string) {
  return new Date(dt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function companyLabel(c: string) {
  switch (c) {
    case "KIPS_PREPS":
      return "KIPS Preps";
    case "TETB":
      return "TETB";
    case "QUALITY_BRANDS":
      return "Quality Brands";
    case "KDP":
      return "KDP";
    default:
      return c;
  }
}

function escapeHtml(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!)
  );
}

async function handler(req: NextRequest) {
  // Auth & RBAC
  const { session } = await requireAuth(req);
  requireManager(req as any);

  // Validate input
  const input = await validateBody(approveTripSchema)(req);

  // Approve/reject trip
  const trip = (await tripService.approveTrip(input, session)) as any;

  logger.info(
    { tripId: trip.id, decision: input.decision, userId: session.sub, recipient: trip.requester?.email },
    "Trip approved/rejected"
  );

  // If auto-assigned (Personal/Entitled), send assignment email
  if (trip.status === TRIP_STATUS.TRANSPORT_ASSIGNED) {
    try {
      await sendAssignmentEmail({
        to: trip.requester!.email,
        subject: "Vehicle Assigned (Auto) — KIPS Transport",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1220">
            <h2 style="color:#2563eb;margin:0 0 10px">Transport Assignment Confirmation</h2>
            <p style="margin:0 0 10px">Dear ${trip.requester?.name ?? "Employee"},</p>
            <p style="margin:0 0 12px">Your request has been <strong>auto-assigned</strong>. Trip details are below:</p>
            <table style="border-collapse:collapse;font-size:14px">
              <tr><td style="padding:2px 8px 2px 0"><strong>Purpose:</strong></td><td>${escapeHtml(trip.purpose)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Company:</strong></td><td>${companyLabel(trip.company)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Department:</strong></td><td>${trip.department ?? "-"}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Passengers:</strong></td><td>${trip.passengerNames || "-"}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>From:</strong></td><td>${escapeHtml(trip.fromLoc)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>To:</strong></td><td>${escapeHtml(trip.toLoc)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Departure:</strong></td><td>${fmt(trip.fromTime)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Return:</strong></td><td>${fmt(trip.toTime)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Driver:</strong></td><td>${escapeHtml(trip.driverName || trip.requester?.name)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Vehicle:</strong></td><td>${escapeHtml(trip.vehicleNumber)}</td></tr>
              <tr><td style="padding:2px 8px 2px 0"><strong>Trip ID:</strong></td><td>${trip.id}</td></tr>
            </table>
            <p style="margin:12px 0 0">Safe travels,<br/><strong>KIPS Transport Department</strong></p>
          </div>
        `,
        text: `Your transport request has been auto-assigned.\nPurpose: ${trip.purpose}\nCompany: ${companyLabel(trip.company)}\nDepartment: ${trip.department ?? "-"}\nPassengers: ${trip.passengerNames || "-"}\nFrom: ${trip.fromLoc} → ${trip.toLoc}\nTime: ${fmt(trip.fromTime)} → ${fmt(trip.toTime)}\nDriver: ${trip.driverName || trip.requester?.name}\nVehicle: ${trip.vehicleNumber}\nTrip ID: ${trip.id}`,
      });
    } catch (error) {
      logger.error({ error, tripId: trip.id }, "Failed to send auto-assignment email");
    }
  }

  // Handle response format
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json");

  if (wantsJson) {
    return NextResponse.json({ ok: true, status: trip.status });
  }

  // Redirect for form submissions
  const url = new URL("/manager", req.url);
  url.searchParams.set(
    "notice",
    input.decision === "approve" ? "Request approved" : "Request rejected"
  );
  url.searchParams.set("kind", "success");
  return NextResponse.redirect(url, 303);
}

export const POST = withErrorHandler(handler);
