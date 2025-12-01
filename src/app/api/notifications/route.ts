import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.sub },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit to 50 most recent notifications
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("[notifications/GET] Error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

