export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/ui/StatCard";
import AddVehicleModal from "./AddVehicleModal";
import ManageVehicleModal from "./ManageVehicleModal";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");

    const vehicles = await prisma.vehicle.findMany({ orderBy: { number: "asc" } });

    const stats = {
        total: vehicles.length,
        active: vehicles.filter(v => v.active).length,
        inactive: vehicles.filter(v => !v.active).length,
        totalCapacity: vehicles.reduce((acc, v) => acc + (v.capacity || 0), 0)
    };

    return { vehicles, stats };
}

export default async function FleetPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { vehicles, stats } = await getData();
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
                    <h1 className="welcome-text">Fleet Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage your transport vehicles and capacity.</p>
                </div>
            </div>

            <div className="stat-grid mb-4">
                <StatCard title="Total Vehicles" value={stats.total} />
                <StatCard title="Active Fleet" value={stats.active} />
                <StatCard title="Inactive" value={stats.inactive} />
                <StatCard title="Total Capacity" value={stats.totalCapacity} />
            </div>

            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Vehicles</h2>

                    <AddVehicleModal />
                </div>

                <div className="table-wrapper">
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Vehicle Info</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Type</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Capacity</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Status</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => (
                                <tr key={v.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {(() => {
                                                let img = null;
                                                try {
                                                    const images = JSON.parse(v.images || "[]");
                                                    if (images.length > 0) img = images[0];
                                                } catch (e) { }

                                                if (img) {
                                                    return (
                                                        <img
                                                            src={img}
                                                            alt={v.number}
                                                            style={{
                                                                width: "48px",
                                                                height: "48px",
                                                                objectFit: "cover",
                                                                borderRadius: "8px",
                                                                border: "1px solid var(--border)"
                                                            }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "8px",
                                                        background: "var(--bg-body)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "20px",
                                                        color: "var(--text-tertiary)",
                                                        border: "1px solid var(--border)"
                                                    }}>
                                                        🚌
                                                    </div>
                                                );
                                            })()}
                                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{v.number}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {v.type || "—"}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {v.capacity ? `${v.capacity} seats` : "—"}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background: v.active ? "var(--success-bg)" : "var(--danger-bg)",
                                            color: v.active ? "var(--success-text)" : "var(--danger-text)"
                                        }}>
                                            {v.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="actions" style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", textAlign: "right" }}>
                                        <ManageVehicleModal vehicle={v} />
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚌</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>No vehicles in fleet</div>
                                        <p>Add your first vehicle to get started.</p>
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
