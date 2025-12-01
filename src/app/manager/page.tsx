export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import StatCard from "@/components/StatCard";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "MANAGER" && session.role !== "ADMIN") {
        redirect(`/${session.role.toLowerCase()}`);
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true }
    });

    const [items, pendingCount, approvedCount] = await Promise.all([
        prisma.trip.findMany({
            where: { status: "Requested" },
            include: { requester: true },
            orderBy: { createdAt: "asc" },
        }),
        prisma.trip.count({ where: { status: "Requested" } }),
        prisma.trip.count({ where: { status: "ManagerApproved" } }),
    ]);

    return { items, pendingCount, approvedCount, userName: user?.name || "Manager" };
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

export default async function ManagerPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { items, pendingCount, approvedCount, userName } = await getData();

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
                <h1 className="welcome-text">Welcome {userName}!</h1>
                <p>Review and approve transport requests.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Pending Review" value={pendingCount} index={0} />
                <StatCard title="Approved" value={approvedCount} index={1} />
                <StatCard title="Team Activity" value="Active" trend="Normal" trendUp={true} index={2} />
            </div>

            <div className="card">
                <h2>Pending Requests</h2>
                <div className="table-wrapper" style={{ marginTop: "20px" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Passengers</th>
                                <th>Purpose</th>
                                <th>Route</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => {
                                let passengerList: string[] = [];
                                try {
                                    if (t.passengerNames) passengerList = JSON.parse(t.passengerNames);
                                } catch (e) { /* ignore */ }

                                return (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{t.requester.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{t.requester.department || "N/A"}</div>
                                        </td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: 500,
                                                background: t.vehicleCategory === "FLEET" ? "var(--info-bg)" :
                                                    t.vehicleCategory === "PERSONAL" ? "var(--warning-bg)" : "var(--success-bg)",
                                                color: t.vehicleCategory === "FLEET" ? "var(--info-text)" :
                                                    t.vehicleCategory === "PERSONAL" ? "var(--warning-text)" : "var(--success-text)"
                                            }}>
                                                {t.vehicleCategory === "FLEET" ? "Fleet" :
                                                    t.vehicleCategory === "PERSONAL" ? "Personal" : "Entitled"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            {passengerList.length > 0 ? (
                                                <details style={{ position: "relative", display: "inline-block" }}>
                                                    <summary style={{
                                                        cursor: "pointer",
                                                        listStyle: "none",
                                                        color: "var(--primary)",
                                                        fontWeight: 500,
                                                        textDecoration: "underline"
                                                    }}>
                                                        {passengerList.length} {passengerList.length === 1 ? "Person" : "People"}
                                                    </summary>
                                                    <div style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        marginTop: 4,
                                                        background: "var(--bg-card)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "8px",
                                                        padding: "12px",
                                                        boxShadow: "var(--shadow-lg)",
                                                        zIndex: 50,
                                                        minWidth: 200,
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Passengers:</div>
                                                        {passengerList.map((name, idx) => (
                                                            <div key={idx} style={{ fontSize: 13, padding: "4px 0" }}>
                                                                {idx + 1}. {name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            ) : "—"}
                                        </td>
                                        <td>{t.purpose}</td>
                                        <td>
                                            {(() => {
                                                let stops: string[] = [];
                                                try {
                                                    if (t.stops) stops = JSON.parse(t.stops);
                                                } catch (e) { /* ignore */ }

                                                if (stops.length > 0) {
                                                    return (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                            <span>{t.fromLoc}</span>
                                                            {stops.map((stop, idx) => (
                                                                <span key={idx} style={{ color: "var(--text-tertiary)" }}>→ {stop}</span>
                                                            ))}
                                                            <span style={{ color: "var(--text-tertiary)" }}>→</span>
                                                            <span>{t.toLoc}</span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span>{t.fromLoc}</span>
                                                        <span style={{ color: "var(--text-tertiary)" }}>→</span>
                                                        <span>{t.toLoc}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>
                                                <div>{fmtDateTime(t.fromTime)}</div>
                                                <div style={{ color: 'var(--text-tertiary)' }}>to {fmtDateTime(t.toTime)}</div>
                                            </div>
                                        </td>
                                        <td className="actions">
                                            <form
                                                action="/api/trips/approve"
                                                method="post"
                                                style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "nowrap" }}
                                            >
                                                <input type="hidden" name="tripId" value={t.id} />
                                                <button 
                                                    name="decision" 
                                                    value="approve" 
                                                    type="submit" 
                                                    className="btn btn-primary" 
                                                    style={{ 
                                                        padding: "8px 16px", 
                                                        fontSize: "13px",
                                                        whiteSpace: "nowrap",
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Approve
                                                </button>

                                                <details style={{ position: "relative", flexShrink: 0 }}>
                                                    <summary 
                                                        style={{ 
                                                            cursor: "pointer", 
                                                            listStyle: "none", 
                                                            padding: "8px 16px", 
                                                            fontSize: "13px",
                                                            whiteSpace: "nowrap"
                                                        }} 
                                                        className="btn btn-secondary" 
                                                        title="Reject"
                                                    >
                                                        Reject
                                                    </summary>
                                                    <div 
                                                        className="dropdown-content" 
                                                        style={{
                                                            width: 320,
                                                            position: "absolute",
                                                            right: 0,
                                                            top: "100%",
                                                            marginTop: 8,
                                                            zIndex: 100,
                                                            background: "var(--bg-panel)",
                                                            boxShadow: "var(--shadow-xl)",
                                                            borderRadius: "var(--radius-md)",
                                                            border: "1px solid var(--border)",
                                                            padding: "16px"
                                                        }}
                                                    >
                                                        <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                                                            Rejection Reason
                                                        </label>
                                                        <textarea
                                                            name="rejectionReason"
                                                            rows={3}
                                                            placeholder="e.g. Trip conflicts with existing schedule..."
                                                            style={{
                                                                width: "100%",
                                                                marginBottom: 12,
                                                                padding: "8px 12px",
                                                                borderRadius: "var(--radius-sm)",
                                                                border: "1px solid var(--input-border)",
                                                                fontSize: "13px",
                                                                resize: "vertical"
                                                            }}
                                                        />
                                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                                            <button 
                                                                name="decision" 
                                                                value="reject" 
                                                                type="submit" 
                                                                className="btn" 
                                                                style={{ 
                                                                    background: "var(--danger-bg)", 
                                                                    color: "var(--danger-text)", 
                                                                    borderColor: "var(--danger-border)",
                                                                    fontSize: "13px", 
                                                                    padding: "8px 16px",
                                                                    whiteSpace: "nowrap"
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
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
                                        No pending requests.
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
