export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import ClaimSubmissionForm from "./ClaimSubmissionForm";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") redirect("/login");

    // Fetch past claims
    const claims = await prisma.tadaRequest.findMany({
        where: { trip: { requesterId: session.sub } },
        include: { trip: true },
        orderBy: { createdAt: "desc" }
    });

    // Fetch eligible trips (Approved/Assigned/Completed trips)
    // Now allowing multiple claims per trip
    const eligibleTrips = await prisma.trip.findMany({
        where: {
            requesterId: session.sub,
            status: { in: ["Approved", "TransportAssigned", "InProgress", "Completed"] }
        },
        orderBy: { createdAt: "desc" }
    });

    return { claims, eligibleTrips };
}

export default async function AllowancesPage({ searchParams }: { searchParams: Promise<{ notice?: string, kind?: string }> }) {
    const { claims, eligibleTrips } = await getData();
    const sp = await searchParams;

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1>Allowances</h1>
                <p>Submit and track your Traveling & Dearness Allowance claims.</p>
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

            <ClaimSubmissionForm eligibleTrips={eligibleTrips} />

            <div className="card">
                <h2>Claim History</h2>
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Trip</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map(c => (
                                <tr key={c.id}>
                                    <td>{fmtDateTime(c.createdAt)}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.trip.purpose}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                            {fmtDateTime(c.trip.fromTime)}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background: "var(--bg-body)",
                                            border: "1px solid var(--border)"
                                        }}>
                                            {c.claimType === "Fuel" ? "⛽ Fuel" :
                                                c.claimType === "Lunch" ? "🍽️ Lunch" :
                                                    c.claimType === "Toll" ? "🛣️ Toll" :
                                                        c.claimType === "Parking" ? "🅿️ Parking" :
                                                            "📋 Other"}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>Rs. {c.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${c.status === "APPROVED" ? "success" :
                                            c.status === "REJECTED" ? "danger" : "warning"
                                            }`}>
                                            {c.status}
                                        </span>
                                        {c.status === "REJECTED" && c.rejectionReason && (
                                            <div style={{ fontSize: 12, color: "var(--danger-text)", marginTop: 4 }}>
                                                {c.rejectionReason}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ maxWidth: 300 }}>{c.description}</td>
                                </tr>
                            ))}
                            {claims.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)" }}>
                                        No claims found.
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
