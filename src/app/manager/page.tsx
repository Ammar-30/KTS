export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
// ⛔ Removed: import Topbar from "@/components/Topbar";

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
                            <th>From → To</th>
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
                                    {t.fromLoc} → {t.toLoc}
                                </td>
                                <td>
                                    {fmtDateTime(t.fromTime)} → {fmtDateTime(t.toTime)}
                                </td>
                                <td className="actions">
                                    <form
                                        action="/api/trips/approve"
                                        method="post"
                                        style={{ display: "inline-flex", gap: 8 }}
                                    >
                                        <input type="hidden" name="tripId" value={t.id} />
                                        <button name="decision" value="approve" type="submit" className="button">
                                            Approve
                                        </button>
                                        <button name="decision" value="reject" type="submit" className="button danger">
                                            Reject
                                        </button>
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
