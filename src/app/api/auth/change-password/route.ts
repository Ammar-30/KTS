import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

// Small helper to support both JSON and <form> submissions
async function readBody(req: NextRequest) {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        try { return await req.json(); } catch { return {}; }
    }
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
}

function redirectBack(urlBase: string, qs: Record<string, string>) {
    const url = new URL(urlBase, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, v);
    // Use 303 for form posts so the browser navigates with GET
    return NextResponse.redirect(url, 303);
}

function validateNewPassword(pw: string): string | null {
    if (pw.length < 8) return "New password must be at least 8 characters.";
    // basic complexity (letter + digit); tweak as you like
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
        return "New password must include at least one letter and one number.";
    }
    return null;
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await readBody(req) as {
        currentPassword?: string; newPassword?: string; confirmPassword?: string;
    };

    // If coming from a form, we want to redirect back to /profile with messages
    const wantsRedirect = !(req.headers.get("content-type") || "").includes("application/json");

    if (!currentPassword || !newPassword || !confirmPassword) {
        const err = "All fields are required.";
        return wantsRedirect
            ? redirectBack("/profile", { error: err })
            : NextResponse.json({ error: err }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
        const err = "New password and confirmation do not match.";
        return wantsRedirect
            ? redirectBack("/profile", { error: err })
            : NextResponse.json({ error: err }, { status: 400 });
    }

    const validationErr = validateNewPassword(newPassword);
    if (validationErr) {
        return wantsRedirect
            ? redirectBack("/profile", { error: validationErr })
            : NextResponse.json({ error: validationErr }, { status: 400 });
    }

    // Load user and verify current password
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
        const err = "User not found.";
        return wantsRedirect
            ? redirectBack("/profile", { error: err })
            : NextResponse.json({ error: err }, { status: 404 });
    }

    const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!ok) {
        const err = "Current password is incorrect.";
        return wantsRedirect
            ? redirectBack("/profile", { error: err })
            : NextResponse.json({ error: err }, { status: 400 });
    }

    // Prevent reusing the same password
    const sameAsOld = await bcrypt.compare(String(newPassword), user.passwordHash);
    if (sameAsOld) {
        const err = "New password must be different from the current password.";
        return wantsRedirect
            ? redirectBack("/profile", { error: err })
            : NextResponse.json({ error: err }, { status: 400 });
    }

    const hash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash },
    });

    return wantsRedirect
        ? redirectBack("/profile", { ok: "1" })
        : NextResponse.json({ ok: true });
}
