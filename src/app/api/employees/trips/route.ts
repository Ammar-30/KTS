import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "MANAGER" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
        return NextResponse.json({ error: "employeeId parameter is required" }, { status: 400 });
    }

    try {
        const trips = await prisma.trip.findMany({
            where: { requesterId: employeeId },
            select: {
                id: true,
                purpose: true,
                fromLoc: true,
                toLoc: true,
                stops: true,
                fromTime: true,
                toTime: true,
                status: true,
                company: true,
                department: true,
                driverName: true,
                vehicleNumber: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ trips });
    } catch (err) {
        console.error("[employees/trips] error:", err);
        return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
    }
}
