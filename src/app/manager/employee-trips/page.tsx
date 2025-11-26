"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Employee = {
    id: string;
    name: string;
    email: string;
};

type Trip = {
    id: string;
    purpose: string;
    fromLoc: string;
    toLoc: string;
    stops: string | null;
    fromTime: string;
    toTime: string;
    status: string;
    company: string;
    department: string | null;
    driverName: string | null;
    vehicleNumber: string | null;
    createdAt: string;
};

export default function EmployeeTripsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const employeeId = searchParams.get("employeeId");

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [tripsLoading, setTripsLoading] = useState(false);

    // Fetch all employees on mount
    useEffect(() => {
        fetch("/api/employees/list")
            .then((res) => res.json())
            .then((data) => {
                setEmployees(data.employees || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch employees:", err);
                setLoading(false);
            });
    }, []);

    // Fetch trips when employee is selected
    useEffect(() => {
        if (!employeeId) {
            setTrips([]);
            return;
        }

        setTripsLoading(true);
        fetch(`/api/employees/trips?employeeId=${employeeId}`)
            .then((res) => res.json())
            .then((data) => {
                setTrips(data.trips || []);
                setTripsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch trips:", err);
                setTripsLoading(false);
            });
    }, [employeeId]);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEmployeeId = e.target.value;
        if (newEmployeeId) {
            router.push(`/manager/employee-trips?employeeId=${newEmployeeId}`);
        } else {
            router.push("/manager/employee-trips");
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "Requested":
                return "badge requested";
            case "ManagerApproved":
                return "badge approved";
            case "ManagerRejected":
                return "badge rejected";
            case "TransportAssigned":
            case "InProgress":
            case "Completed":
                return "badge assigned";
            default:
                return "badge";
        }
    };

    const formatStatus = (status: string) => {
        switch (status) {
            case "ManagerApproved":
                return "Approved";
            case "ManagerRejected":
                return "Rejected";
            case "TransportAssigned":
                return "Assigned";
            case "InProgress":
                return "In Progress";
            default:
                return status;
        }
    };

    const formatDateTime = (dt: string) => {
        return new Date(dt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const companyLabel = (c: string) => {
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
    };

    const parseRoute = (trip: Trip) => {
        let stops: string[] = [];
        try {
            if (trip.stops) {
                stops = JSON.parse(trip.stops);
            }
        } catch (e) {
            // Invalid JSON, ignore
        }

        if (stops.length > 0) {
            return (
                <>
                    {trip.fromLoc}
                    {stops.map((stop, idx) => (
                        <span key={idx}> → {stop}</span>
                    ))}
                    {" → "}
                    {trip.toLoc}
                </>
            );
        }
        return `${trip.fromLoc} → ${trip.toLoc}`;
    };

    const selectedEmployee = employees.find((e) => e.id === employeeId);

    return (
        <>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <a href="/manager" className="button secondary">
                    ← Back to Pending Requests
                </a>
            </div>

            <div className="card">
                <h2>Employee Trip History</h2>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Select Employee</label>
                    <select
                        value={employeeId || ""}
                        onChange={handleEmployeeChange}
                        disabled={loading}
                        style={{ maxWidth: 400 }}
                    >
                        <option value="">-- Select an employee --</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name} ({emp.email})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedEmployee && (
                    <div style={{ marginBottom: 16, padding: 16, background: "var(--info-bg)", borderRadius: 8 }}>
                        <strong>Viewing trips for:</strong> {selectedEmployee.name} ({selectedEmployee.email})
                    </div>
                )}

                {tripsLoading && <div>Loading trips...</div>}

                {!tripsLoading && employeeId && trips.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
                        No trips found for this employee.
                    </div>
                )}

                {!tripsLoading && trips.length > 0 && (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Purpose</th>
                                    <th>Company</th>
                                    <th>Route</th>
                                    <th>Departure → Return</th>
                                    <th>Status</th>
                                    <th>Assignment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.purpose}</td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>{parseRoute(t)}</td>
                                        <td>
                                            {formatDateTime(t.fromTime)}
                                            <br />→ {formatDateTime(t.toTime)}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(t.status)}>
                                                {formatStatus(t.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {t.driverName ? (
                                                <>
                                                    <div>
                                                        <strong>Driver:</strong> {t.driverName}
                                                    </div>
                                                    <div>
                                                        <strong>Vehicle:</strong> {t.vehicleNumber}
                                                    </div>
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!employeeId && !loading && (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
                        Select an employee to view their trip history
                    </div>
                )}
            </div>
        </>
    );
}
