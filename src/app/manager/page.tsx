export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import TripActionButtons from "./TripActionButtons";

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
                <div className={`notice ${kind === "error" ? "notice-error" : "notice-success"}`} style={{
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

            <div className="page-header" style={{ marginBottom: "32px" }}>
                <h1 className="welcome-text">Welcome {userName}!</h1>
                <p>Review and approve transport requests.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Pending Review" value={pendingCount} index={0} />
                <StatCard title="Approved" value={approvedCount} index={1} />
                <StatCard title="Team Activity" value="Active" trend="Normal" trendUp={true} index={2} />
            </div>

            <div className="card" style={{ transform: "none", transition: "none" }}>
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
                                            <div className="font-medium">{t.requester.name}</div>
                                            <div className="text-xs text-muted">{t.requester.department || "N/A"}</div>
                                        </td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>
                                            <StatusBadge status={t.vehicleCategory} type="vehicle" />
                                        </td>
                                        <td className="text-center">
                                            {passengerList.length > 0 ? (
                                                <details className="dropdown-right" style={{ position: "relative", display: "inline-block" }}>
                                                    <summary className="link-primary" style={{
                                                        cursor: "pointer",
                                                        listStyle: "none",
                                                        color: "var(--primary)",
                                                        fontWeight: 500,
                                                        textDecoration: "underline"
                                                    }}>
                                                        {passengerList.length} {passengerList.length === 1 ? "Person" : "People"}
                                                    </summary>
                                                    <div className="dropdown-menu" style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        left: "50%",
                                                        transform: "translateX(-50%)",
                                                        marginTop: 4,
                                                        zIndex: 1000,
                                                        minWidth: 200,
                                                        whiteSpace: "nowrap",
                                                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                                                        border: "1px solid var(--border)"
                                                    }}>
                                                        <div className="dropdown-header" style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Passengers:</div>
                                                        {passengerList.map((name, idx) => (
                                                            <div key={idx} className="dropdown-item" style={{ fontSize: 13, padding: "4px 0" }}>
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
                                                        <div className="route-list" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                            <span>{t.fromLoc}</span>
                                                            {stops.map((stop, idx) => (
                                                                <span key={idx} className="text-muted">→ {stop}</span>
                                                            ))}
                                                            <span className="text-muted">→</span>
                                                            <span>{t.toLoc}</span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="route-simple" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span>{t.fromLoc}</span>
                                                        <span className="text-muted">→</span>
                                                        <span>{t.toLoc}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                <div>{fmtDateTime(t.fromTime)}</div>
                                                <div className="text-muted">to {fmtDateTime(t.toTime)}</div>
                                            </div>
                                        </td>
                                        <td className="actions">
                                            <TripActionButtons tripId={t.id} />
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center p-8 text-muted" style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
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
