import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@lib/auth";
import { maintenanceService } from "@/services/maintenance.service";
import { AppError } from "@/lib/errors";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const requestId = formData.get("requestId") as string;
        const issueDescription = formData.get("issueDescription") as string;

        if (!requestId) {
            return NextResponse.json({ error: "Request ID required" }, { status: 400 });
        }

        if (!issueDescription || issueDescription.trim() === "") {
            return NextResponse.json({ error: "Issue description required" }, { status: 400 });
        }

        await maintenanceService.reportIssue({
            requestId,
            issueDescription: issueDescription.trim()
        }, session);

        // Redirect back to the page
        const referer = req.headers.get("referer") || "/employee";
        return NextResponse.redirect(new URL(referer + "?notice=Issue reported successfully&kind=success", req.url));
    } catch (error) {
        console.error("Error reporting issue:", error);

        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ error: "Failed to report issue" }, { status: 500 });
    }
}
