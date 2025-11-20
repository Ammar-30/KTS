import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import bcrypt from "bcrypt";
import { signSession, setSessionCookie } from "@lib/auth";

const VALID_ROLES = ["EMPLOYEE", "MANAGER", "TRANSPORT", "ADMIN"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        // Narrow role from string -> union literal
        if (!VALID_ROLES.includes(user.role as Role)) {
            // Defensive: role in DB is unexpected
            return NextResponse.json({ error: "Invalid role configured for user" }, { status: 500 });
        }
        const role = user.role as Role;

        const token = await signSession({ sub: user.id, email: user.email, role });
        await setSessionCookie(token);

        return NextResponse.json({ role });
    } catch (e) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
