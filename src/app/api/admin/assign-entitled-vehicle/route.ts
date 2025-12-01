import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const vehicleNumber = formData.get("vehicleNumber") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const userId = formData.get("userId") as string;

    if (!vehicleNumber || !userId) {
        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Missing required fields");
        url.searchParams.set("kind", "error");
        return NextResponse.redirect(url, 303);
    }

    try {
        await prisma.entitledVehicle.create({
            data: {
                vehicleNumber,
                vehicleType: vehicleType || null,
                userId,
                active: true
            }
        });

        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Vehicle assigned successfully");
        url.searchParams.set("kind", "success");
        return NextResponse.redirect(url, 303);
    } catch (error) {
        console.error("Error assigning vehicle:", error);
        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Failed to assign vehicle");
        url.searchParams.set("kind", "error");
        return NextResponse.redirect(url, 303);
    }
}
