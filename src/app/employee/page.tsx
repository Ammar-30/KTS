export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
// ⛔️ Removed: import Topbar from "@/components/Topbar";
import RequestForm from "./RequestForm";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") redirect("/login");

    const trips = await prisma.trip.findMany({
        where: { requesterId: session.sub },
        orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { department: true } // Fetches department from updated schema
    });

    return { trips, department: user?.department };
}

function canCancel(status: string) {
    return status === "Requested" || status === "ManagerApproved";
}

export default async function EmployeePage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { trips, department } = await getData();
    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <div className="shell">
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h1>Employee Dashboard</h1>
                    <p>Manage your transport requests and view trip history.</p>
                </div>
            </div>

            {/* banner (uses URL ?notice=&kind=) */}
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            {/* New Request */}
            <div className="card">
                <div className="flex-between" style={{ marginBottom: 24 }}>
                    <div>
                        <h2>New Transport Request</h2>
                        <p className="text-sm text-muted">Submit a new request for approval.</p>
                    </div>
                    <div style={{ background: 'var(--info-bg)', padding: 8, borderRadius: '50%', color: 'var(--info-text)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 24, height: 24 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                </div>
                <RequestForm department={department || undefined} />
            </div>

            <div style={{ height: 32 }} />

            {/* My Trips */}
            <div>
                <div className="flex-between mb-4">
                    <h2>My Trips</h2>
                    <span className="badge assigned">{trips.length} Total</span>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Company</th>
                                    <th>Department</th>
                                    <th>Purpose</th>
                                    <th>Route</th>
                                    <th>Schedule</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className={`badge ${t.status.toLowerCase()}`}>{t.status}</span>
                                            {t.status === "ManagerRejected" && t.rejectionReason && (
                                                <div style={{
                                                    marginTop: 6,
                                                    padding: 8,
                                                    background: "var(--warning-bg)",
                                                    border: "1px solid rgba(217, 119, 6, 0.2)",
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    color: "var(--warning-text)",
                                                    lineHeight: 1.4
                                                }}>
                                                    <strong>Reason:</strong> {t.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>{t.department ?? "-"}</td>
                                        <td style={{ fontWeight: 500 }}>{t.purpose}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span className="text-muted">{t.fromLoc}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                                <span className="text-muted">{t.toLoc}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>
                                                <div style={{ color: 'var(--text-main)' }}>{fmtDateTime(t.fromTime)}</div>
                                                <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>to {fmtDateTime(t.toTime)}</div>
                                            </div>
                                        </td>
                                        <td className="actions">
                                            {canCancel(t.status) ? (
                                                <form action="/api/trips/cancel" method="post">
                                                    <input type="hidden" name="tripId" value={t.id} />
                                                    <button className="button danger" type="submit" style={{ padding: '6px 12px', fontSize: 13 }}>
                                                        Cancel
                                                    </button>
                                                </form>
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: 13 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {trips.length === 0 && (
                                    <tr className="empty-row">
                                        <td colSpan={7} style={{ padding: 40 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 48, height: 48, color: 'var(--border)' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-muted">No trips found. Submit your first request above.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function companyLabel(c: string) {
    switch (c) {
        case "KIPS_PREPS":
            return "KIPS Preps";
        case "TETB":
            return "TETB";
        case "QUALITY_BRANDS":
            return "Quality Brands";
        case "KDP":
            return "KDP";
        default:
            return c;
    }
}
