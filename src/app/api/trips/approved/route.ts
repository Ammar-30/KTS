import { NextResponse } from "next/server";
import { getSession } from "@lib/auth";
import { prisma } from "@lib/db";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "TRANSPORT" && s.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.trip.findMany({
    where: { status: "ManagerApproved" },
    include: { requester: true },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ items });
}
