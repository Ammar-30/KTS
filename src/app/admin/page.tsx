import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/ui/StatCard";

async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "ADMIN") {
        redirect(`/${session.role.toLowerCase()}`);
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true }
    });

    const [employees, totalUsers, totalTrips, activeVehicles] = await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.user.count(),
        prisma.trip.count(),
        prisma.vehicle.count({ where: { active: true } }),
    ]);

    return { employees, totalUsers, totalTrips, activeVehicles, userName: user?.name || "Admin" };
}

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ notice?: string; kind?: "success" | "error" }>;
}) {
    const { employees, totalUsers, totalTrips, activeVehicles, userName } = await getData();
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
                <p>Here is what's happening today.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Total Users" value={totalUsers} index={0} />
                <StatCard title="Total Trips" value={totalTrips} index={1} />
                <StatCard title="Active Vehicles" value={activeVehicles} index={2} />
                <StatCard title="System Status" value="Healthy" trend="100% Uptime" trendUp={true} index={3} />
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h3>Recent Users</h3>
                    <button className="btn btn-primary">View All Users</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === "ADMIN" ? "assigned" :
                                            u.role === "MANAGER" ? "success" :
                                                u.role === "TRANSPORT" ? "warning" : "neutral"
                                            }`}>
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
