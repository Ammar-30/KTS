import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export const runtime = "nodejs"; // Prisma needs Node runtime

export async function GET(req: NextRequest) {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (s.role !== "TRANSPORT" && s.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("fromTime");
    const toStr = searchParams.get("toTime");

    if (!fromStr || !toStr) {
        return NextResponse.json({ error: "fromTime and toTime are required (ISO)" }, { status: 400 });
    }

    const fromTime = new Date(fromStr);
    const toTime = new Date(toStr);
    if (Number.isNaN(+fromTime) || Number.isNaN(+toTime) || fromTime >= toTime) {
        return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }

    // Find busy driverIds overlapping
    const busyDriverTrips = await prisma.trip.findMany({
        where: {
            driverId: { not: null },
            status: { in: ["TransportAssigned", "InProgress"] },
            AND: [{ fromTime: { lt: toTime } }, { toTime: { gt: fromTime } }]
        },
        select: { driverId: true }
    });
    const busyDriverIds = Array.from(
        new Set(busyDriverTrips.flatMap(t => (t.driverId ? [t.driverId] : [])))
    );

    // Find busy vehicleIds overlapping
    const busyVehicleTrips = await prisma.trip.findMany({
        where: {
            vehicleId: { not: null },
            status: { in: ["TransportAssigned", "InProgress"] },
            AND: [{ fromTime: { lt: toTime } }, { toTime: { gt: fromTime } }]
        },
        select: { vehicleId: true }
    });
    const busyVehicleIds = Array.from(
        new Set(busyVehicleTrips.flatMap(t => (t.vehicleId ? [t.vehicleId] : [])))
    );

    const [drivers, vehicles] = await Promise.all([
        prisma.driver.findMany({
            where: {
                active: true,
                NOT: busyDriverIds.length ? { id: { in: busyDriverIds } } : undefined
            },
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        }),
        prisma.vehicle.findMany({
            where: {
                active: true,
                NOT: busyVehicleIds.length ? { id: { in: busyVehicleIds } } : undefined
            },
            select: { id: true, number: true },
            orderBy: { number: "asc" }
        })
    ]);

    return NextResponse.json({ drivers, vehicles });
}
