import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@lib/auth";
import { prisma } from "@lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const formData = await req.formData();
    const newEmail = formData.get("newEmail") as string;
    const password = formData.get("password") as string;

    if (!newEmail || !password) {
        return NextResponse.redirect(
            new URL("/profile?error=Missing+required+fields", req.url)
        );
    }

    // Verify password
    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { passwordHash: true }
    });

    if (!user) {
        return NextResponse.redirect(
            new URL("/profile?error=User+not+found", req.url)
        );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
        return NextResponse.redirect(
            new URL("/profile?error=Incorrect+password", req.url)
        );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
    });

    if (existingUser && existingUser.id !== session.sub) {
        return NextResponse.redirect(
            new URL("/profile?error=Email+already+in+use", req.url)
        );
    }

    // Update email
    await prisma.user.update({
        where: { id: session.sub },
        data: { email: newEmail }
    });

    return NextResponse.redirect(
        new URL("/profile?ok=1&updated=email", req.url)
    );
}
