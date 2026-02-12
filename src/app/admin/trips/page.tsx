export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/ui/StatCard";
import UserAvatar from "@/components/ui/UserAvatar";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
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

    // Fetch all trips
    const trips = await prisma.trip.findMany({
        where: dateFilter,
        include: {
            requester: true,
            driver: true,
            vehicle: true,
            entitledVehicle: true
        },
        orderBy: { createdAt: "desc" }
    });

    // Fetch all employees for search functionality
    const employees = await prisma.user.findMany({
        orderBy: { name: "asc" }
    });

    // Calculate stats
    const stats = {
        total: trips.length,
        completed: trips.filter(t => t.status === "Completed").length,
        inProgress: trips.filter(t => t.status === "InProgress").length,
        fleet: trips.filter(t => t.vehicleCategory === "FLEET").length,
        entitled: trips.filter(t => t.vehicleCategory === "ENTITLED").length,
    };

    return { trips, employees, stats };
}

export default async function AdminTripsPage({
    searchParams,
}: {
    searchParams: Promise<{ startDate?: string; endDate?: string; employeeId?: string }>;
}) {
    const sp = await searchParams;
    const { trips, employees, stats } = await getData(sp?.startDate, sp?.endDate);

    const selectedEmployeeId = sp?.employeeId;

    // Filter trips by selected employee if any
    const filteredTrips = selectedEmployeeId
        ? trips.filter(t => t.requesterId === selectedEmployeeId)
        : trips;

    const selectedEmployee = selectedEmployeeId
        ? employees.find(e => e.id === selectedEmployeeId)
        : null;

    return (
        <div className="shell">
            <div className="flex-between mb-4">
                <div>
                    <h1 className="welcome-text">Trip Management</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                        View all trip requests and history.
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
                        Search for any employee to view their trip history.
                    </p>

                    <form method="get" action="/admin/trips">
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
                                    href={`/admin/trips?${sp?.startDate ? `startDate=${sp.startDate}&endDate=${sp.endDate}` : ''}`}
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
                                    {filteredTrips.length}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                    Total Trips
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stat-grid mb-4">
                <StatCard title="Total Trips" value={stats.total} />
                <StatCard title="Completed" value={stats.completed} />
                <StatCard title="In Progress" value={stats.inProgress} />
                <StatCard title="Fleet Trips" value={stats.fleet} />
            </div>

            {/* Trips Table */}
            <div className="card">
                <div className="flex-between mb-4" style={{ alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
                    <h2 style={{ margin: 0 }}>
                        {selectedEmployee
                            ? `Trips for ${selectedEmployee.name}`
                            : "All Trips"
                        }
                    </h2>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                        {filteredTrips.length} record{filteredTrips.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="table-wrapper">
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--text-tertiary)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Requester</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Route</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Date & Time</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Vehicle</th>
                                <th style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id} style={{ transition: "background 0.2s" }}>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar name={trip.requester.name} size={36} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                                    {trip.requester.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                    {trip.requester.department}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontWeight: 500 }}>{trip.fromLoc} ➝ {trip.toLoc}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                            {trip.purpose}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <div style={{ fontSize: "14px" }}>{fmtDateTime(trip.fromTime)}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                            to {fmtDateTime(trip.toTime)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        {trip.vehicleCategory === "FLEET" && trip.vehicle ? (
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{trip.vehicle.number}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Fleet</div>
                                            </div>
                                        ) : trip.vehicleCategory === "ENTITLED" && trip.entitledVehicle ? (
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{trip.entitledVehicle.vehicleNumber}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Entitled</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: "var(--text-tertiary)" }}>Pending Assignment</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            background:
                                                trip.status === "Completed" ? "var(--success-bg)" :
                                                    trip.status === "InProgress" ? "var(--info-bg)" :
                                                        trip.status === "Requested" ? "var(--warning-bg)" :
                                                            "var(--bg-body)",
                                            color:
                                                trip.status === "Completed" ? "var(--success-text)" :
                                                    trip.status === "InProgress" ? "var(--info-text)" :
                                                        trip.status === "Requested" ? "var(--warning-text)" :
                                                            "var(--text-secondary)"
                                        }}>
                                            {trip.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredTrips.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚗</div>
                                        <div style={{ fontSize: "16px", fontWeight: 500 }}>
                                            {selectedEmployee
                                                ? `No trips found for ${selectedEmployee.name}`
                                                : "No trips found"
                                            }
                                        </div>
                                        <p style={{ marginTop: "8px" }}>
                                            {sp?.startDate
                                                ? "Try adjusting the date filter to see more results."
                                                : selectedEmployee
                                                    ? "This employee hasn't taken any trips yet."
                                                    : "Trip requests will appear here once submitted."
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
