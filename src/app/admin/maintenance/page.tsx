export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import DateRangeFilter from "@/components/DateRangeFilter";

async function getData(startDate?: string, endDate?: string) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") redirect("/login");

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }

    // Fetch all maintenance requests with related data
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
        where: dateFilter,
        include: {
            requester: true,
            entitledVehicle: {
                include: {
                    assignedTo: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Fetch all employees for search functionality
    const employees = await prisma.user.findMany({
        orderBy: { name: "asc" }
    });

    // Calculate stats
    const stats = {
        total: maintenanceRequests.length,
        completed: maintenanceRequests.filter(r => r.status === "COMPLETED").length,
        inProgress: maintenanceRequests.filter(r => r.status === "IN_PROGRESS").length,
        // Only calculate total cost if date filter is applied
        totalCost: (startDate && endDate)
            ? maintenanceRequests
                .filter(r => r.status === "COMPLETED" && r.cost)
                .reduce((sum, r) => sum + (r.cost || 0), 0)
            : null
    };

    return { maintenanceRequests, employees, stats };
}

export default async function AdminMaintenancePage({
    searchParams,
}: {
    searchParams: Promise<{ employeeId?: string; notice?: string; kind?: "success" | "error"; startDate?: string; endDate?: string }>;
}) {
    const sp = await searchParams;
    const { maintenanceRequests, employees, stats } = await getData(sp?.startDate, sp?.endDate);
    const selectedEmployeeId = sp?.employeeId;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    // Filter maintenance requests by selected employee if any
    const filteredRequests = selectedEmployeeId
        ? maintenanceRequests.filter(r => r.requesterId === selectedEmployeeId)
        : maintenanceRequests;

    const selectedEmployee = selectedEmployeeId
        ? employees.find(e => e.id === selectedEmployeeId)
        : null;

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
                    <h1 className="welcome-text">Maintenance Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                        View all maintenance work and costs across the organization.
                    </p>
                </div>
            </div>

            {/* Date Filter */}
            <DateRangeFilter />

            {/* Stats Cards */}
            <div className="stat-grid mb-4">
                <StatCard title="Total Requests" value={stats.total} />
                <StatCard title="Completed" value={stats.completed} />
                <StatCard title="In Progress" value={stats.inProgress} />
                {stats.totalCost !== null && (
                    <StatCard
                        title="Total Cost"
                        value={`PKR ${stats.totalCost.toLocaleString()}`}
                    />
                )}
            </div>

            {/* Employee Search Section */}
            <div className="card mb-4">
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, marginBottom: "12px" }}>Search Employee</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
                        Search for any employee to view their maintenance records.
                    </p>

                    <form method="get" action="/admin/maintenance">
                        {/* Preserve date filters */}
                        {sp?.startDate && <input type="hidden" name="startDate" value={sp.startDate} />}
                        {sp?.endDate && <input type="hidden" name="endDate" value={sp.endDate} />}

                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>
                                    Select Employee
                                </label>
                                <select
                                    name="employeeId"
                                    defaultValue={selectedEmployeeId || ""}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border)",
                                        fontSize: "14px"
                                    }}
                                >
                                    <option value="">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} - {emp.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ height: "fit-content" }}
                            >
                                🔍 Filter
                            </button>
                            {selectedEmployeeId && (
                                <a
                                    href={`/admin/maintenance?${sp?.startDate ? `startDate=${sp.startDate}&endDate=${sp.endDate}` : ''}`}
                                    className="btn btn-secondary"
                                    style={{ height: "fit-content", textDecoration: "none" }}
                                >
                                    Clear
                                </a>
                            )}
                        </div>
                    </form>

                    {selectedEmployee && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px 16px",
                            background: "var(--bg-body)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <UserAvatar name={selectedEmployee.name} size={40} />
                            <div>
                                <div style={{ fontWeight: 600 }}>{selectedEmployee.name}</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                    {selectedEmployee.email} • {selectedEmployee.role}
                                </div>
                            </div>
                            <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)" }}>
                                    {filteredRequests.length}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    Total Requests
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Maintenance Records Table */}
            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>
                        {selectedEmployee
                            ? `Maintenance Records for ${selectedEmployee.name}`
                            : "All Maintenance Records"
                        }
                    </h2>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                        {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="table-wrapper">
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Employee</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Vehicle</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Description</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Status</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Cost</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((request) => (
                                <tr key={request.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={request.requester.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                                    {request.requester.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                    {request.requester.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontWeight: 600 }}>
                                            {request.entitledVehicle.vehicleNumber}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                            {request.entitledVehicle.vehicleType || "—"}
                                        </div>
                                    </td>
                                    <td style={{
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border-light)",
                                        color: "var(--text-secondary)",
                                        maxWidth: "300px"
                                    }}>
                                        {request.description}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background:
                                                request.status === "COMPLETED" ? "var(--success-bg)" :
                                                    request.status === "IN_PROGRESS" ? "var(--warning-bg)" :
                                                        request.status === "APPROVED" ? "var(--info-bg)" :
                                                            request.status === "REJECTED" ? "var(--danger-bg)" :
                                                                "var(--bg-body)",
                                            color:
                                                request.status === "COMPLETED" ? "var(--success-text)" :
                                                    request.status === "IN_PROGRESS" ? "var(--warning-text)" :
                                                        request.status === "APPROVED" ? "var(--info-text)" :
                                                            request.status === "REJECTED" ? "var(--danger-text)" :
                                                                "var(--text-secondary)"
                                        }}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border-light)",
                                        fontWeight: 600,
                                        color: request.cost ? "var(--text-main)" : "var(--text-tertiary)"
                                    }}>
                                        {request.cost
                                            ? `PKR ${request.cost.toLocaleString()}`
                                            : "—"
                                        }
                                    </td>
                                    <td style={{
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border-light)",
                                        color: "var(--text-secondary)",
                                        fontSize: "14px"
                                    }}>
                                        <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                                        {request.completedAt && (
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                                                Completed: {new Date(request.completedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>
                                            {selectedEmployee
                                                ? `No maintenance records found for ${selectedEmployee.name}`
                                                : "No maintenance records found"
                                            }
                                        </div>
                                        <p style={{ marginTop: "8px" }}>
                                            {sp?.startDate
                                                ? "Try adjusting the date filter to see more results."
                                                : selectedEmployee
                                                    ? "This employee hasn't submitted any maintenance requests yet."
                                                    : "Maintenance requests will appear here once submitted."
                                            }
                                        </p>
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
