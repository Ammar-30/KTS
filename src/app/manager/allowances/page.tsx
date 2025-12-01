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

    const pendingClaims = await prisma.tadaRequest.findMany({
        where: { status: "PENDING" },
        include: {
            trip: {
                include: { requester: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    return { pendingClaims };
}

export default async function ManagerAllowancesPage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { pendingClaims } = await getData();
    const sp = await searchParams;

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1>Allowance Requests</h1>
                <p>Review and approve TADA claims from employees.</p>
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
                <h2>Pending Claims</h2>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Trip Details</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingClaims.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.trip.requester.name}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                            {c.trip.requester.department || "N/A"}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.trip.purpose}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                            {fmtDateTime(c.trip.fromTime)}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>Rs. {c.amount.toLocaleString()}</td>
                                    <td style={{ maxWidth: 300 }}>{c.description}</td>
                                    <td className="actions">
                                        <form action="/api/tada/approve" method="post" style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center" }}>
                                            <input type="hidden" name="requestId" value={c.id} />
                                            <button
                                                name="decision"
                                                value="approve"
                                                className="btn btn-primary"
                                                style={{ 
                                                    padding: "8px 16px", 
                                                    fontSize: 13,
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                name="decision"
                                                value="reject"
                                                className="btn btn-secondary"
                                                style={{ 
                                                    padding: "8px 16px", 
                                                    fontSize: 13, 
                                                    color: "var(--danger-text)", 
                                                    borderColor: "var(--danger-border)",
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {pendingClaims.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)" }}>
                                        No pending claims.
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
