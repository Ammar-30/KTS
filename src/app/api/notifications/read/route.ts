import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { notificationId } = await req.json().catch(() => ({}));
        
        if (notificationId) {
            // Mark a specific notification as read
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId: session.sub, // Ensure user owns the notification
                },
                data: { read: true },
            });
        } else {
            // Mark all notifications as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.sub,
                    read: false,
                },
                data: { read: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[notifications/read/POST] Error:", error);
        return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
    }
}

