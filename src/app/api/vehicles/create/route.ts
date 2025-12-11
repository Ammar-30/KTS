import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import path from "path";
import fs from "fs/promises";

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

    const formData = await req.formData();
    const number = formData.get("number") as string;
    const type = formData.get("type") as string;
    const capacity = formData.get("capacity") as string;
    const imageFile = formData.get("image") as File | null;

    if (!number || !number.trim()) {
        const err = "Vehicle number is required.";
        return redirectBack(req, "/transport/fleet", { notice: err, kind: "error" });
    }

    // Check if vehicle number already exists
    const existing = await prisma.vehicle.findUnique({
        where: { number: number.trim() },
    });

    if (existing) {
        return redirectBack(req, "/transport/fleet", {
            notice: `Vehicle number "${number}" already exists`,
            kind: "error",
        });
    }

    let imageUrls: string[] = [];
    if (imageFile && imageFile.size > 0) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");

            // Ensure directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            const filepath = path.join(uploadDir, filename);
            await fs.writeFile(filepath, buffer);

            imageUrls.push(`/uploads/${filename}`);
        } catch (e) {
            console.error("Failed to upload image:", e);
            // Continue without image if upload fails
        }
    }

    try {
        // Parse capacity properly - ensure it's a valid integer or null
        const capacityValue = capacity && capacity.trim() ? parseInt(capacity.trim(), 10) : null;
        const finalCapacity = capacityValue !== null && !isNaN(capacityValue) ? capacityValue : null;

        await prisma.vehicle.create({
            data: {
                number: number.trim(),
                type: type?.trim() || null,
                capacity: finalCapacity,
                active: true,
                images: JSON.stringify(imageUrls),
            },
        });

        return redirectBack(req, "/transport/fleet", {
            notice: `Vehicle "${number}" added successfully`,
            kind: "success",
        });
    } catch (err) {
        console.error("[vehicles/create] error:", err);
        return redirectBack(req, "/transport/fleet", {
            notice: "Failed to add vehicle",
            kind: "error",
        });
    }
}
