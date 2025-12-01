export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "MANAGER" && session.role !== "ADMIN") redirect("/login");

    const pendingRequests = await prisma.maintenanceRequest.findMany({
        where: { status: "REQUESTED" },
        include: {
            entitledVehicle: true,
            vehicle: true,
            requester: true
        },
        orderBy: { createdAt: "asc" }
    });

    return { pendingRequests };
}

export default async function ManagerMaintenancePage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { pendingRequests } = await getData();
    const sp = await searchParams;

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1>Maintenance Approvals</h1>
                <p>Review and approve vehicle maintenance requests.</p>
            </div>

            {sp?.notice && (
                <div style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    background: sp.kind === "error" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: sp.kind === "error" ? "var(--danger-text)" : "var(--success-text)",
                    fontWeight: 500
                }}>
                    {sp.notice}
                </div>
            )}

            <div className="card">
                <h2>Pending Maintenance Requests</h2>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Vehicle</th>
                                <th>Description</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.map(m => {
                                const isFleetVehicle = !!m.vehicleId;
                                const vehicleNumber = m.entitledVehicle?.vehicleNumber || m.vehicle?.number || "Unknown";
                                const vehicleType = m.entitledVehicle?.vehicleType || m.vehicle?.type || null;
                                
                                return (
                                    <tr key={m.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{m.requester.name}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                {m.requester.department || (isFleetVehicle ? "Transport" : "N/A")}
                                            </div>
                                            {isFleetVehicle && (
                                                <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>
                                                    Fleet Vehicle
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{vehicleNumber}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                {vehicleType || "N/A"}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: 350 }}>{m.description}</td>
                                        <td>{fmtDateTime(m.createdAt)}</td>
                                        <td>
                                            <form action="/api/maintenance/approve" method="post" style={{ display: "flex", gap: 8, alignItems: "start" }}>
                                                <input type="hidden" name="requestId" value={m.id} />
                                                <button
                                                    name="decision"
                                                    value="approve"
                                                    className="btn btn-primary"
                                                    style={{ padding: "6px 12px", fontSize: 13 }}
                                                >
                                                    Approve
                                                </button>
                                                <details style={{ position: "relative" }}>
                                                    <summary style={{
                                                        cursor: "pointer",
                                                        listStyle: "none",
                                                        padding: "6px 12px",
                                                        fontSize: "13px"
                                                    }} className="btn btn-secondary">
                                                        Reject
                                                    </summary>
                                                    <div style={{
                                                        width: 300,
                                                        position: "absolute",
                                                        right: 0,
                                                        left: "auto",
                                                        top: "100%",
                                                        marginTop: 4,
                                                        zIndex: 50,
                                                        background: "var(--bg-card)",
                                                        boxShadow: "var(--shadow-lg)",
                                                        borderRadius: "8px",
                                                        border: "1px solid var(--border)",
                                                        padding: "16px"
                                                    }}>
                                                        <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                                                            Rejection Reason
                                                        </label>
                                                        <textarea
                                                            name="rejectionReason"
                                                            rows={3}
                                                            placeholder="e.g. Not urgent, can wait..."
                                                            className="input-field"
                                                            style={{
                                                                width: "100%",
                                                                marginBottom: 12,
                                                                fontSize: "13px"
                                                            }}
                                                        />
                                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                            <button
                                                                name="decision"
                                                                value="reject"
                                                                type="submit"
                                                                className="btn"
                                                                style={{
                                                                    background: "var(--danger-bg)",
                                                                    color: "var(--danger-text)",
                                                                    fontSize: "13px",
                                                                    padding: "6px 12px"
                                                                }}
                                                            >
                                                                Confirm Rejection
                                                            </button>
                                                        </div>
                                                    </div>
                                                </details>
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })}
                            {pendingRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)" }}>
                                        No pending maintenance requests.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
