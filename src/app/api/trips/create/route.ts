import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function POST(req: NextRequest) {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (s.role !== "EMPLOYEE" && s.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let payload: any = {};
    if (contentType.includes("application/json")) {
        payload = await req.json().catch(() => ({}));
    } else {
        const form = await req.formData();
        payload = Object.fromEntries(form.entries());
    }

    const {
        purpose,
        fromLoc,
        toLoc,
        fromTime,
        toTime,
        company,
        department
    } = payload;

    const redirectBack = (msg: string) => {
        if (!contentType.includes("application/json")) {
            const url = new URL("/employee", req.url);
            url.searchParams.set("error", msg);
            return NextResponse.redirect(url, 303);
        }
        return NextResponse.json({ error: msg }, { status: 400 });
    };

    if (!purpose || !fromLoc || !toLoc || !fromTime || !toTime || !company) {
        return redirectBack("Missing required fields");
    }

    const from = new Date(String(fromTime));
    const to = new Date(String(toTime));
    if (Number.isNaN(+from) || Number.isNaN(+to)) {
        return redirectBack("Invalid date/time");
    }
    if (to < from) {
        return redirectBack("End time must be the same as or after start time");
    }

    const trip = await prisma.trip.create({
        data: {
            purpose: String(purpose),
            fromLoc: String(fromLoc),
            toLoc: String(toLoc),
            fromTime: from,
            toTime: to,
            company: String(company),
            department: department ? String(department) : null,
            requesterId: s.sub,
            status: "Requested"
        },
        select: { id: true }
    });

    if (!contentType.includes("application/json")) {
        const url = new URL("/employee", req.url);
        url.searchParams.set("ok", "1");
        return NextResponse.redirect(url, 303);
    }

    return NextResponse.json({ ok: true, id: trip.id });
}
