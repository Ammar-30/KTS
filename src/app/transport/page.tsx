export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
import StatCard from "@/components/StatCard";

type SelectOption = { id: string; label: string };

async function getSessionGuard() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") {
        redirect(`/${session.role.toLowerCase()}`);
    }
    return session;
}

async function getData() {
    const session = await getSession();
    const user = await prisma.user.findUnique({
        where: { id: session?.sub },
        select: { name: true }
    });

    const items = await prisma.trip.findMany({
        where: { status: "ManagerApproved" },
        include: { requester: true },
        orderBy: { createdAt: "asc" },
    });

    const [activeVehicles, activeDrivers] = await Promise.all([
        prisma.vehicle.count({ where: { active: true } }),
        prisma.driver.count({ where: { active: true } }),
    ]);

    return { items, activeVehicles, activeDrivers, userName: user?.name || "Transport Manager" };
}

// availability: overlap if (A.start < B.end && A.end > B.start)
function overlapFilter(from: Date, to: Date) {
    return {
        AND: [{ fromTime: { lt: to } }, { toTime: { gt: from } }],
    };
}

async function getAvailableDrivers(from: Date, to: Date): Promise<SelectOption[]> {
    const drivers = await prisma.driver.findMany({
        where: {
            active: true,
            trips: {
                none: {
                    AND: [
                        { status: { in: ["TransportAssigned", "InProgress"] } },
                        overlapFilter(from, to),
                    ],
                },
            },
        },
        orderBy: { name: "asc" },
    });
    return drivers.map((d) => ({ id: d.id, label: d.name }));
}

async function getAvailableVehicles(from: Date, to: Date): Promise<SelectOption[]> {
    const vehicles = await prisma.vehicle.findMany({
        where: {
            active: true,
            trips: {
                none: {
                    AND: [
                        { status: { in: ["TransportAssigned", "InProgress"] } },
                        overlapFilter(from, to),
                    ],
                },
            },
        },
        orderBy: [{ type: "asc" }, { number: "asc" }],
    });
    return vehicles.map((v) => ({
        id: v.id,
        label: v.type ? `${v.number} — ${v.type}` : v.number,
    }));
}

function companyLabel(c: string) {
    switch (c) {
        case "KIPS_PREPS": return "KIPS Preps";
        case "TETB": return "TETB";
        case "QUALITY_BRANDS": return "Quality Brands";
        case "KDP": return "KDP";
        default: return c;
    }
}

export default async function TransportPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    await getSessionGuard();
    const { items, activeVehicles, activeDrivers, userName } = await getData();

    // Precompute available lists per trip (server-side)
    const availability = new Map<
        string,
        { drivers: SelectOption[]; vehicles: SelectOption[] }
    >();

    await Promise.all(
        items.map(async (t) => {
            const [drivers, vehicles] = await Promise.all([
                getAvailableDrivers(t.fromTime, t.toTime),
                getAvailableVehicles(t.fromTime, t.toTime),
            ]);
            availability.set(t.id, { drivers, vehicles });
        })
    );

    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {notice && (
                <div style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    background: kind === "error" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: kind === "error" ? "var(--danger-text)" : "var(--success-text)",
                    fontWeight: 500
                }}>
                    {notice}
                </div>
            )}

            <div style={{ marginBottom: "32px" }}>
                <h1 className="welcome-text">Welcome {userName}!</h1>
                <p>Assign drivers and vehicles to approved trips.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Approved Trips" value={items.length} index={0} />
                <StatCard title="Active Drivers" value={activeDrivers} index={1} />
                <StatCard title="Active Vehicles" value={activeVehicles} index={2} />
            </div>

            <div className="card">
                <h2>Approved Trips to Assign</h2>
                <div className="table-wrapper" style={{ marginTop: "20px" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Company</th>
                                <th>Purpose</th>
                                <th>From → To</th>
                                <th>Time</th>
                                <th style={{ minWidth: 400 }}>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => {
                                const avail = availability.get(t.id)!;
                                let passengerList: string[] = [];
                                try {
                                    if (t.passengerNames) passengerList = JSON.parse(t.passengerNames);
                                } catch (e) { /* ignore */ }
                                const passengerCount = passengerList.filter(p => p.trim() !== "").length;
                                
                                return (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{t.requester.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{t.requester.email}</div>
                                        </td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>
                                            <div>{t.purpose}</div>
                                            {passengerCount > 0 && (
                                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                                                    {passengerCount} Passenger{passengerCount !== 1 ? "s" : ""}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>{t.fromLoc}</span>
                                                <span style={{ color: "var(--text-tertiary)" }}>→</span>
                                                <span>{t.toLoc}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>
                                                <div>{fmtDateTime(t.fromTime)}</div>
                                                <div style={{ color: 'var(--text-tertiary)' }}>to {fmtDateTime(t.toTime)}</div>
                                            </div>
                                        </td>
                                        <td className="actions">
                                            <form
                                                action="/api/trips/assign"
                                                method="post"
                                                style={{ display: "flex", gap: 8, flexDirection: "column", minWidth: 360 }}
                                            >
                                                <input type="hidden" name="tripId" value={t.id} />

                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "8px" }}>
                                                    <select 
                                                        name="driverId" 
                                                        required 
                                                        style={{ 
                                                            flex: "1 1 160px",
                                                            minWidth: 160,
                                                            padding: "8px 12px"
                                                        }}
                                                    >
                                                        <option value="">Select driver…</option>
                                                        {avail.drivers.map((d) => (
                                                            <option key={d.id} value={d.id}>
                                                                {d.label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <select 
                                                        name="vehicleId" 
                                                        required 
                                                        style={{ 
                                                            flex: "1 1 160px",
                                                            minWidth: 160,
                                                            padding: "8px 12px"
                                                        }}
                                                    >
                                                        <option value="">Select vehicle…</option>
                                                        {avail.vehicles.map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                                    <div className="input-wrapper" style={{ width: "140px", maxWidth: "100%" }}>
                                                        <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <input
                                                            name="startMileage"
                                                            type="number"
                                                            placeholder="Mileage"
                                                            required
                                                            min="0"
                                                            className="has-icon"
                                                            style={{ width: "100%" }}
                                                        />
                                                    </div>
                                                </div>

                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary" 
                                                    style={{ 
                                                        width: "100%",
                                                        padding: "8px 16px"
                                                    }}
                                                >
                                                    Assign
                                                </button>

                                                {(avail.drivers.length === 0 || avail.vehicles.length === 0) && (
                                                    <div style={{ fontSize: "12px", color: "var(--danger-text)", marginTop: 4 }}>
                                                        {avail.drivers.length === 0 && "No drivers available. "}
                                                        {avail.vehicles.length === 0 && "No vehicles available."}
                                                    </div>
                                                )}
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)" }}>
                                        No manager-approved trips to assign.
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
