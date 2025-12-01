export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");

    const [pendingRequests, fleetVehicles] = await Promise.all([
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
        })
    ]);

    return { pendingRequests, fleetVehicles };
}

export default async function TransportMaintenancePage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { pendingRequests, fleetVehicles } = await getData();
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
                                                <details style={{ position: "relative", display: "inline-block" }}>
                                                    <summary
                                                        className="btn btn-success"
                                                        style={{
                                                            padding: "6px 12px",
                                                            fontSize: 13,
                                                            cursor: "pointer",
                                                            listStyle: "none"
                                                        }}
                                                    >
                                                        Complete Work ▾
                                                    </summary>
                                                    <div
                                                        className="dropdown-menu dropdown-content"
                                                        style={{
                                                            width: "280px",
                                                            padding: "16px",
                                                            position: "absolute",
                                                            right: 0,
                                                            top: "100%",
                                                            marginTop: "4px"
                                                        }}
                                                    >
                                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
                                                            Complete Maintenance
                                                        </h4>
                                                        <form action="/api/maintenance/complete" method="post">
                                                            <input type="hidden" name="requestId" value={m.id} />
                                                            <div style={{ marginBottom: "12px" }}>
                                                                <label style={{
                                                                    display: "block",
                                                                    marginBottom: "6px",
                                                                    fontWeight: 500,
                                                                    fontSize: "13px"
                                                                }}>
                                                                    Cost (PKR)
                                                                </label>
                                                                <input
                                                                    name="cost"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="Enter cost in PKR (optional)"
                                                                    className="input-field"
                                                                />
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                className="btn btn-success"
                                                                style={{ width: "100%" }}
                                                            >
                                                                Mark as Complete
                                                            </button>
                                                        </form>
                                                    </div>
                                                </details>
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
