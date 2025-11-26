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

    try {
        const employees = await prisma.user.findMany({
            where: { role: "EMPLOYEE" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ employees });
    } catch (err) {
        console.error("[employees/list] error:", err);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}
