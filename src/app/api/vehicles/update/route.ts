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

    const { id, number, type, capacity, active } = (await readBody(req)) as {
        id?: string;
        number?: string;
        type?: string;
        capacity?: string;
        active?: string;
    };

    if (!id) {
        const err = "Vehicle ID is required.";
        return redirectBack(req, "/transport/manage", { notice: err, kind: "error" });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
        return redirectBack(req, "/transport/manage", {
            notice: "Vehicle not found",
            kind: "error",
        });
    }

    try {
        await prisma.vehicle.update({
            where: { id },
            data: {
                number: number?.trim() || vehicle.number,
                type: type !== undefined ? (type.trim() || null) : vehicle.type,
                capacity: capacity !== undefined ? (capacity ? parseInt(capacity) : null) : vehicle.capacity,
                active: active !== undefined ? active === "true" : vehicle.active,
            },
        });

        return redirectBack(req, "/transport/manage", {
            notice: "Vehicle updated successfully",
            kind: "success",
        });
    } catch (err) {
        console.error("[vehicles/update] error:", err);
        return redirectBack(req, "/transport/manage", {
            notice: "Failed to update vehicle",
            kind: "error",
        });
    }
}
