export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";

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

                    <details className="dropdown-right" style={{ position: "relative" }}>
                        <summary className="btn btn-primary" style={{ listStyle: "none", cursor: "pointer" }}>
                            + Add Vehicle
                        </summary>
                        <div className="dropdown-menu">
                            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Add New Vehicle</h3>
                            <form action="/api/vehicles/create" method="post">
                                <div className="form-group mb-3">
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Vehicle Number *</label>
                                    <input name="number" required placeholder="LEA-1234" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                </div>
                                <div className="form-group mb-3">
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Type</label>
                                    <input name="type" placeholder="Sedan, SUV, Van..." className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                </div>
                                <div className="form-group mb-4">
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Capacity</label>
                                    <input name="capacity" type="number" placeholder="4" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Vehicle</button>
                            </form>
                        </div>
                    </details>
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
                                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{v.number}</div>
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
                                        <details style={{ position: "relative", display: "inline-block" }}>
                                            <summary className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", listStyle: "none", whiteSpace: "nowrap" }}>
                                                Manage ▾
                                            </summary>
                                            <div className="dropdown-menu dropdown-right" style={{ width: "280px", padding: "16px", top: "100%", marginTop: 8 }}>
                                                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Edit Vehicle</h4>
                                                <form action="/api/vehicles/update" method="post">
                                                    <input type="hidden" name="id" value={v.id} />
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                        <input name="number" defaultValue={v.number} placeholder="Number" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                                        <input name="type" defaultValue={v.type || ""} placeholder="Type" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                                        <input name="capacity" type="number" defaultValue={v.capacity || ""} placeholder="Capacity" style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                                                        <select name="active" defaultValue={v.active ? "true" : "false"} style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                                            <option value="true">Active</option>
                                                            <option value="false">Inactive</option>
                                                        </select>
                                                        <button type="submit" className="btn btn-primary" style={{ marginTop: "4px" }}>Save Changes</button>
                                                    </div>
                                                </form>

                                                {v.active && (
                                                    <>
                                                        <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid var(--border)" }} />
                                                        <form action="/api/vehicles/delete" method="post">
                                                            <input type="hidden" name="id" value={v.id} />
                                                            <button type="submit" className="btn" style={{ width: "100%", background: "var(--danger-bg)", color: "var(--danger-text)", border: "none" }}>
                                                                Deactivate Vehicle
                                                            </button>
                                                        </form>
                                                    </>
                                                )}
                                            </div>
                                        </details>
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
