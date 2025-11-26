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

    const { id } = (await readBody(req)) as { id?: string };

    if (!id) {
        const err = "Vehicle ID is required.";
        return redirectBack(req, "/transport/manage", { notice: err, kind: "error" });
    }

    try {
        // Soft delete: set active to false instead of deleting
        await prisma.vehicle.update({
            where: { id },
            data: { active: false },
        });

        return redirectBack(req, "/transport/manage", {
            notice: "Vehicle deactivated successfully",
            kind: "success",
        });
    } catch (err) {
        console.error("[vehicles/delete] error:", err);
        return redirectBack(req, "/transport/manage", {
            notice: "Failed to deactivate vehicle",
            kind: "error",
        });
    }
}
