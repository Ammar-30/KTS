import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload: any = {};
    const form = await req.formData().catch(async () => null);
    if (form) {
        payload = { tripId: String(form.get("tripId") || "") };
    } else {
        payload = await req.json().catch(() => ({}));
    }
    const { tripId } = payload;
    if (!tripId) return NextResponse.json({ error: "Missing tripId" }, { status: 400 });

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const isOwner = trip.requesterId === s.sub;
    const isPrivileged = s.role === "ADMIN" || s.role === "TRANSPORT" || s.role === "MANAGER";

    if (!isOwner && !isPrivileged) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Block cancel if already assigned or beyond
    const blocked = ["TransportAssigned", "InProgress", "Completed"];
    if (blocked.includes(trip.status)) {
        return NextResponse.json({ error: `Cannot cancel when status is ${trip.status}` }, { status: 409 });
    }

    await prisma.trip.update({
        where: { id: trip.id },
        data: { status: "Cancelled" }
    });

    // If it was a form post (user clicked button), redirect back to /employee with a toast flag
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const url = new URL(isOwner ? "/employee" : "/transport", req.url);
        url.searchParams.set("ok", "cancelled");
        return NextResponse.redirect(url, 303);
    }

    return NextResponse.json({ ok: true });
}
