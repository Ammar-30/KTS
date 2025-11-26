import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import bcrypt from "bcrypt";

function redirectBack(req: NextRequest, fallback: string, qs?: Record<string, string>) {
    const ref = req.headers.get("referer") || fallback;
    const url = new URL(ref);
    if (qs) for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, v);
    return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fd = await req.formData();
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const role = fd.get("role") as string;
    const department = fd.get("department") as string;

    if (!name || !email || !password) {
        return redirectBack(req, "/admin", { notice: "Name, email and password are required", kind: "error" });
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return redirectBack(req, "/admin", { notice: "Email already exists", kind: "error" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: role || "EMPLOYEE",
            department: department || null,
        },
    });

    return redirectBack(req, "/admin", { notice: `User ${name} created successfully`, kind: "success" });
}
