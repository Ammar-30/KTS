import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "TRANSPORT" && session.role !== "ADMIN") redirect("/login");

    const [drivers, vehicles] = await Promise.all([
        prisma.driver.findMany({ orderBy: { name: "asc" } }),
        prisma.vehicle.findMany({ orderBy: { number: "asc" } }),
    ]);

    return { drivers, vehicles };
}

export default async function ManagePage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { drivers, vehicles } = await getData();

    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <a href="/transport" className="button secondary">
                    ← Back to Assignments
                </a>
            </div>

            {/* Drivers Section */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h2>Drivers Management</h2>

                {/* Add Driver Form */}
                <details style={{ marginBottom: 16 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: 8 }}>
                        + Add New Driver
                    </summary>
                    <form action="/api/drivers/create" method="post" style={{ marginTop: 12 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <input name="name" required placeholder="Driver name" />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input name="phone" placeholder="0300-1234567" />
                            </div>
                            <div className="form-group">
                                <label>License No</label>
                                <input name="licenseNo" placeholder="License number" />
                            </div>
                        </div>
                        <button type="submit" className="button primary" style={{ marginTop: 8 }}>
                            Add Driver
                        </button>
                    </form>
                </details>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>License No</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((d) => (
                                <tr key={d.id}>
                                    <td>{d.name}</td>
                                    <td>{d.phone || "-"}</td>
                                    <td>{d.licenseNo || "-"}</td>
                                    <td>
                                        <span className={d.active ? "badge" : "badge danger"}>
                                            {d.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <details>
                                            <summary style={{ cursor: "pointer" }}>Edit</summary>
                                            <form
                                                action="/api/drivers/update"
                                                method="post"
                                                style={{ marginTop: 8, padding: 8, border: "1px solid var(--border)", borderRadius: 6 }}
                                            >
                                                <input type="hidden" name="id" value={d.id} />
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    <input name="name" defaultValue={d.name} placeholder="Name" />
                                                    <input name="phone" defaultValue={d.phone || ""} placeholder="Phone" />
                                                    <input name="licenseNo" defaultValue={d.licenseNo || ""} placeholder="License No" />
                                                    <select name="active" defaultValue={d.active ? "true" : "false"}>
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                    <button type="submit" className="button">Update</button>
                                                </div>
                                            </form>
                                        </details>
                                        {d.active && (
                                            <form action="/api/drivers/delete" method="post" style={{ display: "inline" }}>
                                                <input type="hidden" name="id" value={d.id} />
                                                <button
                                                    type="submit"
                                                    className="button danger"
                                                >
                                                    Deactivate
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {drivers.length === 0 && (
                                <tr className="empty-row">
                                    <td colSpan={5}>No drivers found. Add your first driver above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="card">
                <h2>Vehicles Management</h2>

                {/* Add Vehicle Form */}
                <details style={{ marginBottom: 16 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: 8 }}>
                        + Add New Vehicle
                    </summary>
                    <form action="/api/vehicles/create" method="post" style={{ marginTop: 12 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Vehicle Number *</label>
                                <input name="number" required placeholder="LEA-1234" />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <input name="type" placeholder="Sedan, SUV, Van, etc." />
                            </div>
                            <div className="form-group">
                                <label>Capacity</label>
                                <input name="capacity" type="number" placeholder="5" />
                            </div>
                        </div>
                        <button type="submit" className="button primary" style={{ marginTop: 8 }}>
                            Add Vehicle
                        </button>
                    </form>
                </details>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => (
                                <tr key={v.id}>
                                    <td>{v.number}</td>
                                    <td>{v.type || "-"}</td>
                                    <td>{v.capacity || "-"}</td>
                                    <td>
                                        <span className={v.active ? "badge" : "badge danger"}>
                                            {v.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <details>
                                            <summary style={{ cursor: "pointer" }}>Edit</summary>
                                            <form
                                                action="/api/vehicles/update"
                                                method="post"
                                                style={{ marginTop: 8, padding: 8, border: "1px solid var(--border)", borderRadius: 6 }}
                                            >
                                                <input type="hidden" name="id" value={v.id} />
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    <input name="number" defaultValue={v.number} placeholder="Number" />
                                                    <input name="type" defaultValue={v.type || ""} placeholder="Type" />
                                                    <input name="capacity" type="number" defaultValue={v.capacity || ""} placeholder="Capacity" />
                                                    <select name="active" defaultValue={v.active ? "true" : "false"}>
                                                        <option value="true">Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                    <button type="submit" className="button">Update</button>
                                                </div>
                                            </form>
                                        </details>
                                        {v.active && (
                                            <form action="/api/vehicles/delete" method="post" style={{ display: "inline" }}>
                                                <input type="hidden" name="id" value={v.id} />
                                                <button
                                                    type="submit"
                                                    className="button danger"
                                                >
                                                    Deactivate
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr className="empty-row">
                                    <td colSpan={5}>No vehicles found. Add your first vehicle above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
