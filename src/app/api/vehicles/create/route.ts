import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

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

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { number, type, capacity } = (await readBody(req)) as {
        number?: string;
        type?: string;
        capacity?: string;
    };

    if (!number || !number.trim()) {
        const err = "Vehicle number is required.";
        return redirectBack(req, "/transport/manage", { notice: err, kind: "error" });
    }

    // Check if vehicle number already exists
    const existing = await prisma.vehicle.findUnique({
        where: { number: number.trim() },
    });

    if (existing) {
        return redirectBack(req, "/transport/manage", {
            notice: `Vehicle number "${number}" already exists`,
            kind: "error",
        });
    }

    try {
        await prisma.vehicle.create({
            data: {
                number: number.trim(),
                type: type?.trim() || null,
                capacity: capacity ? parseInt(capacity) : null,
                active: true,
            },
        });

        return redirectBack(req, "/transport/manage", {
            notice: `Vehicle "${number}" added successfully`,
            kind: "success",
        });
    } catch (err) {
        console.error("[vehicles/create] error:", err);
        return redirectBack(req, "/transport/manage", {
            notice: "Failed to add vehicle",
            kind: "error",
        });
    }
}
