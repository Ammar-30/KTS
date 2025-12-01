export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import RequestForm from "../RequestForm";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: {
            department: true,
            entitledVehicles: {
                where: { active: true },
                select: { id: true, vehicleNumber: true, vehicleType: true }
            }
        }
    });

    return {
        department: user?.department,
        entitledVehicles: user?.entitledVehicles || []
    };
}

export default async function RequestTripPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { department, entitledVehicles } = await getData();
    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {notice && (
                <div style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    background: kind === "error" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: kind === "error" ? "var(--danger-text)" : "var(--success-text)",
                    fontWeight: 500
                }}>
                    {notice}
                </div>
            )}

            <div style={{ marginBottom: "32px" }}>
                <h1>Request a Trip</h1>
                <p>Submit a new transport request for approval.</p>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h3>New Transport Request</h3>
                </div>
                <RequestForm
                    department={department || undefined}
                    entitledVehicles={entitledVehicles}
                />
            </div>
        </>
    );
}
