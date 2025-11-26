import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { sendAssignmentEmail } from "@lib/email";

async function readBody(req: NextRequest) {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        try {
            return await req.json();
        } catch {
            return {};
        }
    }
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
}

function redirectBack(req: NextRequest, fallback: string, qs?: Record<string, string>) {
    const ref = req.headers.get("referer") || fallback;
    const url = new URL(ref);
    if (qs) for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, v);
    return NextResponse.redirect(url, 303);
}

function overlapFilter(from: Date, to: Date) {
    return {
        AND: [{ fromTime: { lt: to } }, { toTime: { gt: from } }],
    };
}

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

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { tripId, driverId, vehicleId, startMileage } = (await readBody(req)) as {
        tripId?: string;
        driverId?: string;
        vehicleId?: string;
        startMileage?: string | number;
    };
    const wantsJson = (req.headers.get("content-type") || "").includes("application/json");

    if (!tripId || !driverId || !vehicleId) {
        const err = "tripId, driverId and vehicleId are required.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    if (!startMileage || isNaN(Number(startMileage)) || Number(startMileage) < 0) {
        const err = "Valid starting mileage is required.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    // Include requester so we can email them
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { requester: true },
    });

    if (!trip) {
        const err = "Trip not found.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 404 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }
    if (trip.status !== "ManagerApproved") {
        const err = "Only ManagerApproved trips can be assigned.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    // Validate driver availability
    const driverBusy = await prisma.trip.findFirst({
        where: {
            driverId,
            status: { in: ["TransportAssigned", "InProgress"] },
            ...overlapFilter(trip.fromTime, trip.toTime),
        },
        select: { id: true },
    });
    if (driverBusy) {
        const err = "Selected driver is already occupied in this time slot.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 409 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    // Validate vehicle availability
    const vehicleBusy = await prisma.trip.findFirst({
        where: {
            vehicleId,
            status: { in: ["TransportAssigned", "InProgress"] },
            ...overlapFilter(trip.fromTime, trip.toTime),
        },
        select: { id: true },
    });
    if (vehicleBusy) {
        const err = "Selected vehicle is already assigned in this time slot.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 409 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    // Fetch driver/vehicle display fields for email/logs
    const [driver, vehicle] = await Promise.all([
        prisma.driver.findUnique({ where: { id: driverId } }),
        prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);
    if (!driver || !vehicle) {
        const err = "Driver or vehicle not found.";
        return wantsJson
            ? NextResponse.json({ error: err }, { status: 404 })
            : redirectBack(req, "/transport", { notice: err, kind: "error" });
    }

    // Update assignment
    await prisma.trip.update({
        where: { id: tripId },
        data: {
            status: "TransportAssigned",
            assignedById: session.sub,
            driverId,
            vehicleId,
            // keep display fields in sync
            driverName: driver.name,
            vehicleNumber: vehicle.number,
            startMileage: startMileage ? Number(startMileage) : null,
        },
    });

    // ---- EMAIL: notify requester (includes Company & Department) ----
    try {
        const subj = "Vehicle Assigned — KIPS Transport";
        const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1220">
        <h2 style="color:#2563eb;margin:0 0 10px">Transport Assignment Confirmation</h2>
        <p style="margin:0 0 10px">Dear ${trip.requester?.name ?? "Employee"},</p>
        <p style="margin:0 0 12px">Your request has been <strong>assigned</strong>. Trip details are below:</p>

        <table style="border-collapse:collapse;font-size:14px">
          <tr><td style="padding:2px 8px 2px 0"><strong>Purpose:</strong></td><td>${escapeHtml(
            trip.purpose
        )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Company:</strong></td><td>${companyLabel(
            trip.company
        )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Department:</strong></td><td>${trip.department ?? "-"
            }</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>From:</strong></td><td>${escapeHtml(
                trip.fromLoc
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>To:</strong></td><td>${escapeHtml(
                trip.toLoc
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Departure:</strong></td><td>${fmt(
                trip.fromTime
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Return:</strong></td><td>${fmt(
                trip.toTime
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Driver:</strong></td><td>${escapeHtml(
                driver.name
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Driver Contact:</strong></td><td>${driver.phone || "Not provided"
            }</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Vehicle:</strong></td><td>${escapeHtml(
                vehicle.number
            )}</td></tr>
          <tr><td style="padding:2px 8px 2px 0"><strong>Trip ID:</strong></td><td>${trip.id}</td></tr>
        </table>

        <p style="margin:12px 0 0">Safe travels,<br/><strong>KIPS Transport Department</strong></p>
      </div>
    `;
        const text =
            `Your transport request has been assigned.\n` +
            `Purpose: ${trip.purpose}\n` +
            `Company: ${companyLabel(trip.company)}\n` +
            `Department: ${trip.department ?? "-"}\n` +
            `From: ${trip.fromLoc} → ${trip.toLoc}\n` +
            `Time: ${fmt(trip.fromTime)} → ${fmt(trip.toTime)}\n` +
            `Driver: ${driver.name}\n` +
            `Driver Contact: ${driver.phone || "Not provided"}\n` +
            `Vehicle: ${vehicle.number}\n` +
            `Trip ID: ${trip.id}`;

        // Note: sendAssignmentEmail should gracefully no-op if SMTP envs are missing.
        await sendAssignmentEmail({
            to: trip.requester.email,
            subject: subj,
            html,
            text,
        });
    } catch (err) {
        // Never fail the request due to email issues
        console.error("[assign email] send failed:", err);
    }
    // ----------------------------------------------------------------

    const msg = `Trip assigned to ${driver.name} • ${vehicle.number}`;
    return wantsJson
        ? NextResponse.json({ ok: true, notice: msg })
        : redirectBack(req, "/transport", { notice: msg, kind: "success" });
}

function escapeHtml(s: unknown): string {
    return String(s).replace(/[&<>\"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
