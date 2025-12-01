export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import DateRangeFilter from "@/components/DateRangeFilter";
import { fmtDateTime } from "@lib/utils";

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

    // Fetch all TADA requests
    const tadaRequests = await prisma.tadaRequest.findMany({
        where: dateFilter,
        include: {
            trip: {
                include: {
                    requester: true
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
        total: tadaRequests.length,
        approved: tadaRequests.filter(r => r.status === "APPROVED").length,
        pending: tadaRequests.filter(r => r.status === "PENDING").length,
        // Only calculate total amount if date filter is applied
        totalAmount: (startDate && endDate)
            ? tadaRequests
                .filter(r => r.status === "APPROVED")
                .reduce((sum, r) => sum + r.amount, 0)
            : null
    };

    return { tadaRequests, employees, stats };
}

export default async function AdminTadaPage({
    searchParams,
}: {
    searchParams: Promise<{ employeeId?: string; startDate?: string; endDate?: string }>;
}) {
    const sp = await searchParams;
    const { tadaRequests, employees, stats } = await getData(sp?.startDate, sp?.endDate);

    const selectedEmployeeId = sp?.employeeId;

    // Filter TADA requests by selected employee if any
    const filteredRequests = selectedEmployeeId
        ? tadaRequests.filter(r => r.trip.requesterId === selectedEmployeeId)
        : tadaRequests;

    const selectedEmployee = selectedEmployeeId
        ? employees.find(e => e.id === selectedEmployeeId)
        : null;

    return (
        <div className="shell">
            <div className="flex-between mb-4">
                <div>
                    <h1 className="welcome-text">TADA Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                        View all TADA requests and reimbursements.
                    </p>
                </div>
            </div>

            {/* Date Filter */}
            <DateRangeFilter />

            {/* Employee Search Section */}
            <div className="card mb-4">
                <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "16px", marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, marginBottom: "12px" }}>Search Employee</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
                        Search for any employee to view their TADA requests.
                    </p>

                    <form method="get" action="/admin/tada">
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
                                    href={`/admin/tada?${sp?.startDate ? `startDate=${sp.startDate}&endDate=${sp.endDate}` : ''}`}
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

            {/* Stats Cards */}
            <div className="stat-grid mb-4">
                <StatCard title="Total Requests" value={stats.total} />
                <StatCard title="Approved" value={stats.approved} />
                <StatCard title="Pending" value={stats.pending} />
                {stats.totalAmount !== null && (
                    <StatCard
                        title="Total Amount"
                        value={`PKR ${stats.totalAmount.toLocaleString()}`}
                    />
                )}
            </div>

            {/* TADA Table */}
            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>
                        {selectedEmployee
                            ? `TADA Requests for ${selectedEmployee.name}`
                            : "All TADA Requests"
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
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Trip</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Amount</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Status</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((request) => (
                                <tr key={request.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={request.trip.requester.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                                    {request.trip.requester.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                    {request.trip.requester.department}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontWeight: 500 }}>{request.trip.fromLoc} ➝ {request.trip.toLoc}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                            {fmtDateTime(request.trip.fromTime)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                            PKR {request.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background:
                                                request.status === "APPROVED" ? "var(--success-bg)" :
                                                    request.status === "PENDING" ? "var(--warning-bg)" :
                                                        request.status === "REJECTED" ? "var(--danger-bg)" :
                                                            "var(--bg-body)",
                                            color:
                                                request.status === "APPROVED" ? "var(--success-text)" :
                                                    request.status === "PENDING" ? "var(--warning-text)" :
                                                        request.status === "REJECTED" ? "var(--danger-text)" :
                                                            "var(--text-secondary)"
                                        }}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>💰</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>
                                            {selectedEmployee
                                                ? `No TADA requests found for ${selectedEmployee.name}`
                                                : "No TADA requests found"
                                            }
                                        </div>
                                        <p style={{ marginTop: "8px" }}>
                                            {sp?.startDate
                                                ? "Try adjusting the date filter to see more results."
                                                : selectedEmployee
                                                    ? "This employee hasn't submitted any TADA requests yet."
                                                    : "TADA requests will appear here once submitted."
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
