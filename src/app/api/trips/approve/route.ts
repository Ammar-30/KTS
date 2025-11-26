import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

async function readBody(req: NextRequest) {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        try { return await req.json(); } catch { return {}; }
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

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "MANAGER" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { tripId, decision, rejectionReason } = await readBody(req) as {
        tripId?: string;
        decision?: string;
        rejectionReason?: string;
    };
    const wantsJson = (req.headers.get("content-type") || "").includes("application/json");

    if (!tripId || !decision) {
        const err = "tripId and decision are required.";
        return wantsJson ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/manager", { notice: err, kind: "error" });
    }

    if (!["approve", "reject"].includes(decision)) {
        const err = "decision must be 'approve' or 'reject'.";
        return wantsJson ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/manager", { notice: err, kind: "error" });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
        const err = "Trip not found.";
        return wantsJson ? NextResponse.json({ error: err }, { status: 404 })
            : redirectBack(req, "/manager", { notice: err, kind: "error" });
    }

    if (trip.status !== "Requested") {
        const err = "Only Requested trips can be approved/rejected.";
        return wantsJson ? NextResponse.json({ error: err }, { status: 400 })
            : redirectBack(req, "/manager", { notice: err, kind: "error" });
    }

    const newStatus = decision === "approve" ? "ManagerApproved" : "ManagerRejected";
    await prisma.trip.update({
        where: { id: tripId },
        data: {
            status: newStatus,
            approvedById: session.sub,
            rejectionReason: decision === "reject" ? (rejectionReason || null) : null,
        },
    });

    const msg = decision === "approve" ? "Request approved" : "Request rejected";
    return wantsJson
        ? NextResponse.json({ ok: true, status: newStatus })
        : redirectBack(req, "/manager", { notice: msg, kind: "success" });
}
