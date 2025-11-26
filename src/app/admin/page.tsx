import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") redirect("/login");

    const employees = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return { employees };
}

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { employees } = await getData();
    const sp = await searchParams;
    const notice = sp?.notice;
    const kind = sp?.kind === "error" ? "error" : "success";

    return (
        <>
            {notice && <div className={`banner ${kind}`}>{notice}</div>}

            <div className="flex-between mb-4">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage employees and system settings.</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <h2>Add New Employee</h2>
                <form action="/api/admin/create-employee" method="post" style={{ marginTop: 16 }}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name *</label>
                            <input name="name" required placeholder="Full Name" />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input name="email" type="email" required placeholder="email@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Password *</label>
                            <input name="password" type="password" required placeholder="Initial password" />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" defaultValue="EMPLOYEE">
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="TRANSPORT">Transport</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input name="department" placeholder="e.g. IT, HR, Sales" />
                        </div>
                    </div>
                    <button type="submit" className="button primary" style={{ marginTop: 16 }}>
                        Create Employee
                    </button>
                </form>
            </div>

            <div className="card">
                <h2>All Users ({employees.length})</h2>
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === "ADMIN" ? "assigned" : u.role === "MANAGER" ? "approved" : "requested"}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{u.department || "-"}</td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
