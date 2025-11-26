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

    const { name, phone, licenseNo } = (await readBody(req)) as {
        name?: string;
        phone?: string;
        licenseNo?: string;
    };

    if (!name || !name.trim()) {
        const err = "Driver name is required.";
        return redirectBack(req, "/transport/manage", { notice: err, kind: "error" });
    }

    try {
        await prisma.driver.create({
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
                licenseNo: licenseNo?.trim() || null,
                active: true,
            },
        });

        return redirectBack(req, "/transport/manage", {
            notice: `Driver "${name}" added successfully`,
            kind: "success",
        });
    } catch (err) {
        console.error("[drivers/create] error:", err);
        return redirectBack(req, "/transport/manage", {
            notice: "Failed to add driver",
            kind: "error",
        });
    }
}
