export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import CompleteMaintenanceModal from "./CompleteMaintenanceModal";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");

    const [pendingRequests, fleetVehicles, reportedIssues] = await Promise.all([
        prisma.maintenanceRequest.findMany({
            where: { status: { in: ["APPROVED", "IN_PROGRESS"] } },
            include: {
                entitledVehicle: true,
                vehicle: true,
                requester: true
            },
            orderBy: { createdAt: "asc" }
        }),
        prisma.vehicle.findMany({
            where: { active: true },
            orderBy: [{ type: "asc" }, { number: "asc" }]
        }),
        prisma.maintenanceRequest.findMany({
            where: { issueReported: true },
            include: {
                entitledVehicle: true,
                vehicle: true,
                requester: true
            },
            orderBy: { issueReportedAt: "desc" }
        })
    ]);

    return { pendingRequests, fleetVehicles, reportedIssues };
}

export default async function TransportMaintenancePage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { pendingRequests, fleetVehicles, reportedIssues } = await getData();
    const sp = await searchParams;

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1>Vehicle Maintenance</h1>
                <p>Manage maintenance requests for entitled and fleet vehicles.</p>
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

            {/* Reported Issues Section */}
            {reportedIssues.length > 0 && (
                <div className="card" style={{ marginBottom: "24px", border: "1px solid var(--warning-border)", background: "var(--warning-bg)" }}>
                    <h2 style={{ color: "var(--warning-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                        ⚠️ Reported Issues ({reportedIssues.length})
                    </h2>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                        Employees have reported issues with completed maintenance work.
                    </p>
                    <div className="table-wrapper" style={{ marginTop: 12 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Vehicle</th>
                                    <th>Original Work</th>
                                    <th>Issue Description</th>
                                    <th>Reported</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportedIssues.map(m => {
                                    const vehicleNumber = m.entitledVehicle?.vehicleNumber || m.vehicle?.number || "Unknown";
                                    const vehicleType = m.entitledVehicle?.vehicleType || m.vehicle?.type || null;

                                    return (
                                        <tr key={m.id}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{m.requester.name}</div>
                                                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                    {m.requester.email}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{vehicleNumber}</div>
                                                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                    {vehicleType || "N/A"}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: 200 }}>{m.description}</td>
                                            <td style={{ maxWidth: 250, color: "var(--warning-text)", fontWeight: 500 }}>
                                                {m.issueDescription}
                                            </td>
                                            <td>{m.issueReportedAt && fmtDateTime(m.issueReportedAt)}</td>
                                            <td>
                                                <form action="/api/maintenance/resolve-issue" method="post">
                                                    <input type="hidden" name="requestId" value={m.id} />
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: "6px 12px", fontSize: 12 }}
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Fleet Vehicle Maintenance Request Form */}
            <div className="card" style={{ marginBottom: "24px" }}>
                <h2>Request Fleet Vehicle Maintenance</h2>
                <form action="/api/maintenance/create-fleet" method="post" style={{ marginTop: 20 }}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Fleet Vehicle</label>
                            <select name="vehicleId" required className="input-field">
                                <option value="">-- Select Fleet Vehicle --</option>
                                {fleetVehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.number} {v.type ? `(${v.type})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                required
                                placeholder="Describe the maintenance needed..."
                                className="input-field"
                                rows={3}
                                style={{ resize: "vertical" }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: "12px" }}>
                        Submit Maintenance Request
                    </button>
                </form>
            </div>

            <div className="card">
                <h2>Pending Maintenance Requests</h2>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Vehicle</th>
                                <th>Description</th>
                                <th>Status</th>
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
                                        <td style={{ maxWidth: 300 }}>{m.description}</td>
                                        <td>
                                            <span className={`badge ${m.status === "IN_PROGRESS" ? "info" : "success"}`}>
                                                {m.status === "IN_PROGRESS" ? "In Progress" : "Approved"}
                                            </span>
                                        </td>
                                        <td>{fmtDateTime(m.createdAt)}</td>
                                        <td>
                                            {m.status === "APPROVED" && (
                                                <form action="/api/maintenance/start" method="post">
                                                    <input type="hidden" name="requestId" value={m.id} />
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: "6px 12px", fontSize: 13 }}
                                                    >
                                                        Start Work
                                                    </button>
                                                </form>
                                            )}
                                            {m.status === "IN_PROGRESS" && (
                                                <CompleteMaintenanceModal requestId={m.id} />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {pendingRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)" }}>
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

