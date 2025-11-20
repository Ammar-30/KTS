export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime, badgeClass } from "@lib/utils";
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

    return { trips };
}

function canCancel(status: string) {
    return status === "Requested" || status === "ManagerApproved";
}

export default async function EmployeePage({
                                               searchParams,
                                           }: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { trips } = await getData();
    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {/* banner (uses URL ?notice=&kind=) */}
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            {/* New Request */}
            <div className="card">
                <h2>New Transport Request</h2>
                <RequestForm />
            </div>

            <div style={{ height: 16 }} />

            {/* My Trips */}
            <div className="card">
                <h2>My Trips</h2>
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Status</th>
                            <th>Company</th>
                            <th>Department</th>
                            <th>Purpose</th>
                            <th>From → To</th>
                            <th>Time</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trips.map((t) => (
                            <tr key={t.id}>
                                <td>
                                    <span className={badgeClass(t.status)}>{t.status}</span>
                                </td>
                                <td>{companyLabel(t.company)}</td>
                                <td>{t.department ?? "-"}</td>
                                <td>{t.purpose}</td>
                                <td>
                                    {t.fromLoc} → {t.toLoc}
                                </td>
                                <td>
                                    {fmtDateTime(t.fromTime)} → {fmtDateTime(t.toTime)}
                                </td>
                                <td className="actions">
                                    {canCancel(t.status) ? (
                                        <form action="/api/trips/cancel" method="post">
                                            <input type="hidden" name="tripId" value={t.id} />
                                            <button className="button danger" type="submit">
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <span className="helper">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {trips.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={7}>No trips yet. Submit your first request above.</td>
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
