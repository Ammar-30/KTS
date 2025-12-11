export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import ReportIssueModal from "@/components/ReportIssueModal";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") redirect("/login");

    // Fetch user's entitled vehicles
    const entitledVehicles = await prisma.entitledVehicle.findMany({
        where: { userId: session.sub, active: true }
    });

    // Fetch maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
        where: { requesterId: session.sub },
        include: { entitledVehicle: true },
        orderBy: { createdAt: "desc" }
    });

    return { entitledVehicles, maintenanceRequests };
}

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { entitledVehicles, maintenanceRequests } = await getData();
    const sp = await searchParams;

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1>Vehicle Maintenance</h1>
                <p>Request maintenance for your entitled vehicles.</p>
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

            {entitledVehicles.length > 0 && (
                <div className="card">
                    <h2>Request Maintenance</h2>
                    <form action="/api/maintenance/create" method="post" style={{ marginTop: 20 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Vehicle</label>
                                {entitledVehicles.length === 1 ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={`${entitledVehicles[0].vehicleNumber}${entitledVehicles[0].vehicleType ? ` (${entitledVehicles[0].vehicleType})` : ""}`}
                                            disabled
                                            className="input-field"
                                            style={{
                                                width: "100%",
                                                padding: "12px 16px",
                                                borderRadius: "var(--radius-md)",
                                                border: "1px solid var(--border)",
                                                background: "var(--input-bg)",
                                                color: "var(--text-secondary)",
                                                cursor: "not-allowed"
                                            }}
                                        />
                                        <input type="hidden" name="entitledVehicleId" value={entitledVehicles[0].id} />
                                    </div>
                                ) : (
                                    <select name="entitledVehicleId" required className="input-field">
                                        <option value="">-- Select Vehicle --</option>
                                        {entitledVehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.vehicleNumber} {v.vehicleType ? `(${v.vehicleType})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Maintenance Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Describe the maintenance needed..."
                                required
                                style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: "15px", fontFamily: "inherit" }}
                            ></textarea>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" className="button primary">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Maintenance History</h2>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maintenanceRequests.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{m.entitledVehicle?.vehicleNumber || "—"}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                            {m.entitledVehicle?.vehicleType || "N/A"}
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: 300 }}>{m.description}</td>
                                    <td>
                                        <span className={`badge ${m.status === "COMPLETED" ? "success" :
                                            m.status === "IN_PROGRESS" ? "info" :
                                                m.status === "APPROVED" ? "success" :
                                                    m.status === "REJECTED" ? "danger" : "warning"
                                            }`}>
                                            {m.status === "IN_PROGRESS" ? "In Progress" :
                                                m.status === "APPROVED" ? "Approved" :
                                                    m.status === "REJECTED" ? "Rejected" :
                                                        m.status === "COMPLETED" ? "Completed" : "Pending"}
                                        </span>
                                        {m.status === "REJECTED" && m.rejectionReason && (
                                            <div style={{ fontSize: 12, color: "var(--danger-text)", marginTop: 4 }}>
                                                {m.rejectionReason}
                                            </div>
                                        )}
                                        {m.issueReported && (
                                            <div style={{
                                                fontSize: 11,
                                                color: "var(--warning-text)",
                                                marginTop: 4,
                                                background: "var(--warning-bg)",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                display: "inline-block"
                                            }}>
                                                ⚠️ Issue Reported
                                            </div>
                                        )}
                                    </td>
                                    <td>{fmtDateTime(m.createdAt)}</td>
                                    <td>
                                        {m.status === "IN_PROGRESS" && (
                                            <form action="/api/maintenance/complete" method="post">
                                                <input type="hidden" name="requestId" value={m.id} />
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: "6px 12px", fontSize: 13 }}
                                                >
                                                    Mark Complete
                                                </button>
                                            </form>
                                        )}
                                        {m.status === "COMPLETED" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                    Completed: {m.completedAt && fmtDateTime(m.completedAt)}
                                                </div>
                                                {!m.issueReported && (
                                                    <ReportIssueModal requestId={m.id} />
                                                )}
                                                {m.issueReported && m.issueDescription && (
                                                    <div style={{ fontSize: 12, color: "var(--warning-text)", marginTop: 4 }}>
                                                        Issue: {m.issueDescription}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {m.status === "REQUESTED" && (
                                            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                                Awaiting manager approval
                                            </span>
                                        )}
                                        {m.status === "APPROVED" && (
                                            <span style={{ fontSize: 12, color: "var(--success-text)" }}>
                                                Approved - awaiting transport
                                            </span>
                                        )}
                                        {m.status === "REJECTED" && (
                                            <span style={{ fontSize: 12, color: "var(--danger-text)" }}>
                                                —
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {maintenanceRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)" }}>
                                        No maintenance requests found.
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

