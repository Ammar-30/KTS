import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@lib/auth";
import { prisma } from "@lib/db";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string | null;

    if (!id || !name || !email || !role) {
        return NextResponse.redirect(
            new URL("/admin/employees?error=Missing+required+fields&kind=error", req.url)
        );
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role: role as any,
                department: department || null
            }
        });

        return NextResponse.redirect(
            new URL("/admin/employees?notice=User+updated+successfully", req.url)
        );
    } catch (error) {
        return NextResponse.redirect(
            new URL("/admin/employees?error=Failed+to+update+user&kind=error", req.url)
        );
    }
}
