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

    const { id, name, phone, licenseNo, active } = (await readBody(req)) as {
        id?: string;
        name?: string;
        phone?: string;
        licenseNo?: string;
        active?: string;
    };

    if (!id) {
        const err = "Driver ID is required.";
        return redirectBack(req, "/transport/manage", { notice: err, kind: "error" });
    }

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
        return redirectBack(req, "/transport/manage", {
            notice: "Driver not found",
            kind: "error",
        });
    }

    try {
        await prisma.driver.update({
            where: { id },
            data: {
                name: name?.trim() || driver.name,
                phone: phone !== undefined ? (phone.trim() || null) : driver.phone,
                licenseNo: licenseNo !== undefined ? (licenseNo.trim() || null) : driver.licenseNo,
                active: active !== undefined ? active === "true" : driver.active,
            },
        });

        return redirectBack(req, "/transport/manage", {
            notice: "Driver updated successfully",
            kind: "success",
        });
    } catch (err) {
        console.error("[drivers/update] error:", err);
        return redirectBack(req, "/transport/manage", {
            notice: "Failed to update driver",
            kind: "error",
        });
    }
}
