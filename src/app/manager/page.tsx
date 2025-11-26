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
    if (session.role !== "MANAGER" && session.role !== "ADMIN") redirect("/login");

    const items = await prisma.trip.findMany({
        where: { status: "Requested" },
        include: { requester: true },
        orderBy: { createdAt: "asc" },
    });

    return { items };
}

export default async function ManagerPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { items } = await getData();

    const sp = await searchParams; // Next 16: searchParams is a Promise
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {/* URL banner */}
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <a href="/manager/employee-trips" className="button secondary">
                    👥 View Employee Trips
                </a>
            </div>

            <div className="card">
                <h2>Pending Requests</h2>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Company</th>
                                <th>Department</th>
                                <th>Purpose</th>
                                <th>Route</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        {t.requester.name}{" "}
                                        <span className="helper">({t.requester.email})</span>
                                    </td>
                                    <td>{companyLabel(t.company)}</td>
                                    <td>{t.department ?? "-"}</td>
                                    <td>{t.purpose}</td>
                                    <td>
                                        {(() => {
                                            let stops: string[] = [];
                                            try {
                                                if (t.stops) {
                                                    stops = JSON.parse(t.stops);
                                                }
                                            } catch (e) {
                                                // Invalid JSON, ignore
                                            }

                                            if (stops.length > 0) {
                                                return (
                                                    <>
                                                        {t.fromLoc}
                                                        {stops.map((stop, idx) => (
                                                            <span key={idx}> → {stop}</span>
                                                        ))}
                                                        {" → "}{t.toLoc}
                                                    </>
                                                );
                                            }
                                            return `${t.fromLoc} → ${t.toLoc}`;
                                        })()}
                                    </td>
                                    <td>
                                        {fmtDateTime(t.fromTime)} → {fmtDateTime(t.toTime)}
                                    </td>
                                    <td className="actions">
                                        <form
                                            action="/api/trips/approve"
                                            method="post"
                                            style={{ display: "inline-flex", gap: 8, alignItems: "start" }}
                                        >
                                            <input type="hidden" name="tripId" value={t.id} />
                                            <button name="decision" value="approve" type="submit" className="button">
                                                Approve
                                            </button>

                                            <details>
                                                <summary style={{ cursor: "pointer" }} className="button danger">
                                                    Reject
                                                </summary>
                                                <div style={{
                                                    marginTop: 8,
                                                    padding: 12,
                                                    border: "1px solid var(--border)",
                                                    borderRadius: 8,
                                                    background: "var(--panel)",
                                                    minWidth: 250
                                                }}>
                                                    <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                                                        Rejection Reason (optional)
                                                    </label>
                                                    <textarea
                                                        name="rejectionReason"
                                                        rows={3}
                                                        placeholder="e.g. Trip conflicts with existing schedule..."
                                                        style={{
                                                            width: "100%",
                                                            marginBottom: 8,
                                                            padding: "8px",
                                                            borderRadius: "6px",
                                                            border: "1px solid var(--input-border)"
                                                        }}
                                                    />
                                                    <button name="decision" value="reject" type="submit" className="button danger">
                                                        Confirm Rejection
                                                    </button>
                                                </div>
                                            </details>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr className="empty-row">
                                    <td colSpan={7}>No pending requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
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
