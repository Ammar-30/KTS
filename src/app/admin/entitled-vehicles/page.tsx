export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import DeleteVehicleButton from "@/components/DeleteVehicleButton";
import AddEntitledVehicleModal from "./AddEntitledVehicleModal";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") redirect("/login");

    const vehicles = await prisma.entitledVehicle.findMany({
        include: {
            assignedTo: {
                select: { name: true, email: true }
            }
        },
        orderBy: { assignedAt: "desc" }
    });

    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true }
    });

    const stats = {
        total: vehicles.length,
        active: vehicles.filter(v => v.active).length,
    };

    return { vehicles, users, stats };
}

export default async function EntitledVehiclesPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { vehicles, users, stats } = await getData();
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
                    <h1 className="welcome-text">Entitled Vehicles</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage officially entitled vehicles and assignments.</p>
                </div>
            </div>

            <div className="stat-grid mb-4">
                <StatCard title="Total Vehicles" value={stats.total} />
                <StatCard title="Active Assignments" value={stats.active} />
            </div>

            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Vehicles Directory</h2>

                    <AddEntitledVehicleModal users={users} />
                </div>

                <div className="table-wrapper">
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Vehicle</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Assigned To</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Assigned Date</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => (
                                <tr key={v.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{v.vehicleNumber}</div>
                                        {v.vehicleType && <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{v.vehicleType}</div>}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={v.assignedTo.name} size={32} />
                                            <div>
                                                <div style={{ fontWeight: 500, color: "var(--text-main)" }}>{v.assignedTo.name}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{v.assignedTo.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {new Date(v.assignedAt).toLocaleDateString()}
                                    </td>
                                    <td className="actions" style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", textAlign: "right" }}>
                                        <DeleteVehicleButton vehicleId={v.id} />
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚗</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>No entitled vehicles found</div>
                                        <p>Assign a vehicle to an employee to get started.</p>
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
