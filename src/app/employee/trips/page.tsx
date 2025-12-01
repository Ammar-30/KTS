export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") redirect("/login");

    const trips = await prisma.trip.findMany({
        where: { requesterId: session.sub },
        orderBy: { createdAt: "desc" },
    });

    return { trips };
}

function canCancel(status: string) {
    return status === "Requested" || status === "ManagerApproved";
}

function companyLabel(c: string) {
    switch (c) {
        case "KIPS_PREPS": return "KIPS Preps";
        case "TETB": return "TETB";
        case "QUALITY_BRANDS": return "Quality Brands";
        case "KDP": return "KDP";
        default: return c;
    }
}

export default async function MyTripsPage() {
    const { trips } = await getData();

    return (
        <>
            <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>My Trips</h1>
                    <p>View the status and history of your transport requests.</p>
                </div>
                <a href="/employee/request" className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Request
                </a>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Company</th>
                            <th>Passengers</th>
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
                                    <span className={`badge ${t.status.includes("Approved") ? "success" :
                                        t.status.includes("Rejected") ? "danger" :
                                            t.status.includes("Assigned") ? "info" : "warning"
                                        }`}>
                                        {t.status}
                                    </span>
                                    {t.status === "ManagerRejected" && t.rejectionReason && (
                                        <div style={{ fontSize: "11px", color: "var(--danger-text)", marginTop: "6px", maxWidth: "150px", lineHeight: 1.4 }}>
                                            {t.rejectionReason}
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontWeight: 500 }}>{companyLabel(t.company)}</td>
                                <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{t.passengerNames || "-"}</td>
                                <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{t.purpose}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: "13px" }}>
                                        <span style={{ color: "var(--text-main)" }}>{t.fromLoc}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 14, height: 14, color: "var(--text-tertiary)" }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        <span style={{ color: "var(--text-main)" }}>{t.toLoc}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: 13 }}>
                                        <div style={{ fontWeight: 500 }}>{fmtDateTime(t.fromTime)}</div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: "12px" }}>to {fmtDateTime(t.toTime)}</div>
                                    </div>
                                </td>
                                <td className="actions">
                                    {canCancel(t.status) ? (
                                        <form action="/api/trips/cancel" method="post" style={{ display: "inline-block" }}>
                                            <input type="hidden" name="tripId" value={t.id} />
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ 
                                                    padding: "8px 16px", 
                                                    fontSize: "13px", 
                                                    color: "var(--danger-text)", 
                                                    borderColor: "var(--danger-border)", 
                                                    background: "white",
                                                    whiteSpace: "nowrap"
                                                }} 
                                                type="submit"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <span style={{ color: "var(--text-tertiary)", fontSize: "20px" }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {trips.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "64px", color: "var(--text-tertiary)" }}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 48, height: 48, margin: "0 auto", opacity: 0.2 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    No trips found. <a href="/employee/request" style={{ color: "var(--primary)", fontWeight: 500 }}>Request your first trip</a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
