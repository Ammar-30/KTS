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

    if (!id) {
        return NextResponse.redirect(
            new URL("/admin/employees?error=Missing+user+ID&kind=error", req.url)
        );
    }

    // Prevent admin from deleting themselves
    if (id === session.sub) {
        return NextResponse.redirect(
            new URL("/admin/employees?error=Cannot+delete+your+own+account&kind=error", req.url)
        );
    }

    try {
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.redirect(
            new URL("/admin/employees?notice=User+deleted+successfully", req.url)
        );
    } catch (error) {
        return NextResponse.redirect(
            new URL("/admin/employees?error=Failed+to+delete+user&kind=error", req.url)
        );
    }
}
