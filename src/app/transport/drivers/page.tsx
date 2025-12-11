export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import { fmtDateTime } from "@lib/utils";
import AddDriverModal from "./AddDriverModal";
import ManageDriverModal from "./ManageDriverModal";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");

    const now = new Date();

    // Get all drivers with their trip counts
    const drivers = await prisma.driver.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { trips: true }
            },
            trips: {
                where: {
                    status: { in: ["TransportAssigned", "InProgress"] },
                    fromTime: { lte: now },
                    toTime: { gte: now }
                },
                include: {
                    requester: {
                        select: { name: true }
                    }
                },
                orderBy: { fromTime: "asc" },
                take: 1 // Only need the current trip
            }
        }
    });

    const stats = {
        total: drivers.length,
        active: drivers.filter(d => d.active).length,
        inactive: drivers.filter(d => !d.active).length,
        onTrip: drivers.filter(d => d.trips.length > 0 && d.active).length,
    };

    return { drivers, stats };
}

export default async function DriversPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { drivers, stats } = await getData();
    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <div className="shell">
            {notice && (
                <div style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    background: kind === "error" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: kind === "error" ? "var(--danger-text)" : "var(--success-text)",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    {kind === "error" ? "⚠️" : "✅"} {notice}
                </div>
            )}

            <div className="flex-between mb-4">
                <div>
                    <h1 className="welcome-text">Driver Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage your drivers and their assignments.</p>
                </div>
            </div>

            <div className="stat-grid mb-4">
                <StatCard title="Total Drivers" value={stats.total} />
                <StatCard title="Active Drivers" value={stats.active} />
                <StatCard title="On Trip Now" value={stats.onTrip} />
                <StatCard title="Inactive" value={stats.inactive} />
            </div>

            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Drivers Directory</h2>

                    <AddDriverModal />
                </div>

                <div className="table-wrapper">
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Driver</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Contact</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>License</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Status</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Current Trip</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((d) => (
                                <tr key={d.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={d.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{d.name}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{d._count.trips} trips completed</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {d.phone || "—"}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        <code style={{ background: "var(--bg-body)", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                                            {d.licenseNo || "NO LICENSE"}
                                        </code>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background: d.active ? "var(--success-bg)" : "var(--danger-bg)",
                                            color: d.active ? "var(--success-text)" : "var(--danger-text)"
                                        }}>
                                            {d.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)", fontSize: "13px" }}>
                                        {d.trips.length > 0 ? (
                                            <div>
                                                <div style={{ fontWeight: 500, color: "var(--text-main)", marginBottom: "4px" }}>
                                                    🚗 On Trip
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                                                    {d.trips[0].requester.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                                                    {fmtDateTime(d.trips[0].fromTime)} - {fmtDateTime(d.trips[0].toTime)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: "var(--text-tertiary)" }}>Available</span>
                                        )}
                                    </td>
                                    <td className="actions" style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", textAlign: "right" }}>
                                        <ManageDriverModal driver={d} />
                                    </td>
                                </tr>
                            ))}
                            {drivers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍✈️</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>No drivers found</div>
                                        <p>Add your first driver to get started.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
