export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { fmtDateTime } from "@lib/utils";
// ⛔ Removed: import Topbar from "@/components/Topbar";

type SelectOption = { id: string; label: string };

async function getSessionGuard() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");
    return session;
}

async function getManagerApprovedTrips() {
    return prisma.trip.findMany({
        where: { status: "ManagerApproved" },
        include: { requester: true },
        orderBy: { createdAt: "asc" },
    });
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
}

export default async function TransportPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    await getSessionGuard();
    const items = await getManagerApprovedTrips();

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
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <a href="/transport/manage" className="button secondary">
                    ⚙️ Manage Drivers & Vehicles
                </a>
            </div>

            <div className="card">
                <h2>Approved Trips to Assign</h2>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Requester</th>
                                <th>Company</th>
                                <th>Department</th>
                                <th>Purpose</th>
                                <th>From → To</th>
                                <th>Time</th>
                                <th style={{ minWidth: 360 }}>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((t) => {
                                const avail = availability.get(t.id)!;
                                return (
                                    <tr key={t.id}>
                                        <td>
                                            {t.requester.name}
                                            <div className="helper">({t.requester.email})</div>
                                        </td>
                                        <td>{companyLabel(t.company)}</td>
                                        <td>{t.department ?? "-"}</td>
                                        <td>{t.purpose}</td>
                                        <td>
                                            {t.fromLoc} → {t.toLoc}
                                        </td>
                                        <td>
                                            {fmtDateTime(t.fromTime)} → {fmtDateTime(t.toTime)}
                                        </td>
                                        <td>
                                            <form
                                                action="/api/trips/assign"
                                                method="post"
                                                className="actions"
                                                style={{ gap: 8, flexWrap: "wrap" }}
                                            >
                                                <input type="hidden" name="tripId" value={t.id} />

                                                <select name="driverId" required style={{ minWidth: 160 }}>
                                                    <option value="">Select driver…</option>
                                                    {avail.drivers.map((d) => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select name="vehicleId" required style={{ minWidth: 160 }}>
                                                    <option value="">Select vehicle…</option>
                                                    {avail.vehicles.map((v) => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    name="startMileage"
                                                    type="number"
                                                    placeholder="Mileage"
                                                    required
                                                    min="0"
                                                    style={{ width: 100 }}
                                                />

                                                <button type="submit" className="button">
                                                    Assign
                                                </button>
                                            </form>

                                            {(avail.drivers.length === 0 || avail.vehicles.length === 0) && (
                                                <div className="helper" style={{ marginTop: 6 }}>
                                                    {avail.drivers.length === 0 && "No available drivers for this slot. "}
                                                    {avail.vehicles.length === 0 && "No available vehicles for this slot."}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {items.length === 0 && (
                                <tr className="empty-row">
                                    <td colSpan={7}>No manager-approved trips.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
