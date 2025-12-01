import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;

    if (!id) {
        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Missing vehicle ID");
        url.searchParams.set("kind", "error");
        return NextResponse.redirect(url, 303);
    }

    try {
        await prisma.entitledVehicle.delete({
            where: { id }
        });

        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Vehicle assignment removed");
        url.searchParams.set("kind", "success");
        return NextResponse.redirect(url, 303);
    } catch (error) {
        console.error("Error removing vehicle:", error);
        const url = new URL("/admin/entitled-vehicles", req.url);
        url.searchParams.set("notice", "Failed to remove vehicle assignment");
        url.searchParams.set("kind", "error");
        return NextResponse.redirect(url, 303);
    }
}
