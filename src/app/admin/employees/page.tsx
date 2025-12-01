export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import UserManageDropdown from "@/components/UserManageDropdown";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") redirect("/login");

    const employees = await prisma.user.findMany({
        orderBy: { name: "asc" }
    });

    const stats = {
        total: employees.length,
        employees: employees.filter(u => u.role === "EMPLOYEE").length,
        managers: employees.filter(u => u.role === "MANAGER").length,
        transport: employees.filter(u => u.role === "TRANSPORT").length,
    };

    return { employees, stats };
}

export default async function EmployeesPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { employees, stats } = await getData();
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
                    <h1 className="welcome-text">Employee Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage users and their roles.</p>
                </div>
            </div>

            <div className="stat-grid mb-4">
                <StatCard title="Total Users" value={stats.total} />
                <StatCard title="Employees" value={stats.employees} />
                <StatCard title="Managers" value={stats.managers} />
                <StatCard title="Transport Staff" value={stats.transport} />
            </div>

            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>Users Directory</h2>

                    <details className="dropdown-right" style={{ position: "relative" }}>
                        <summary className="btn btn-primary" style={{ listStyle: "none", cursor: "pointer" }}>
                            + Add Employee
                        </summary>
                        <div className="dropdown-menu dropdown-content" style={{ 
                            width: "420px", 
                            padding: "24px",
                            background: "var(--bg-panel)",
                            borderRadius: "var(--radius-lg)",
                            boxShadow: "var(--shadow-xl)",
                            border: "1px solid var(--border-light)"
                        }}>
                            <h3 style={{ 
                                marginTop: 0, 
                                marginBottom: "24px",
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "var(--text-main)",
                                letterSpacing: "-0.02em"
                            }}>Add New Employee</h3>
                            <form action="/api/admin/create-employee" method="post" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                <div className="form-group" style={{ marginBottom: "20px" }}>
                                    <label>Name *</label>
                                    <input name="name" required placeholder="Full Name" />
                                </div>
                                <div className="form-group" style={{ marginBottom: "20px" }}>
                                    <label>Email *</label>
                                    <input name="email" type="email" required placeholder="email@example.com" />
                                </div>
                                <div className="form-group" style={{ marginBottom: "20px" }}>
                                    <label>Password *</label>
                                    <input name="password" type="password" required placeholder="Initial password" />
                                </div>
                                <div className="form-group" style={{ marginBottom: "20px" }}>
                                    <label>Role</label>
                                    <select name="role" defaultValue="EMPLOYEE" style={{ 
                                        width: "100%",
                                        fontWeight: 500
                                    }}>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="TRANSPORT">Transport</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: "24px" }}>
                                    <label>Department</label>
                                    <input name="department" placeholder="e.g. IT, HR, Sales" />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ 
                                    width: "100%",
                                    padding: "12px 24px",
                                    fontSize: "15px",
                                    fontWeight: 600
                                }}>Create User</button>
                            </form>
                        </div>
                    </details>
                </div>

                <div className="table-wrapper" style={{ overflow: "visible", position: "relative" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>User</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Email</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Role</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Department</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Joined</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((u) => (
                                <tr key={u.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={u.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {u.email}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background: u.role === "ADMIN" ? "var(--info-bg)" :
                                                u.role === "MANAGER" ? "var(--success-bg)" :
                                                    u.role === "TRANSPORT" ? "var(--warning-bg)" : "var(--bg-body)",
                                            color: u.role === "ADMIN" ? "var(--info-text)" :
                                                u.role === "MANAGER" ? "var(--success-text)" :
                                                    u.role === "TRANSPORT" ? "var(--warning-text)" : "var(--text-secondary)"
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {u.department || "—"}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="actions" style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", textAlign: "right" }}>
                                        <UserManageDropdown user={u} />
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>No users found</div>
                                        <p>Add your first user to get started.</p>
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
