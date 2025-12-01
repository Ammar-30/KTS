export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/StatCard";


async function getData() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "EMPLOYEE" && session.role !== "ADMIN") {
        redirect(`/${session.role.toLowerCase()}`);
    }

    const trips = await prisma.trip.findMany({
        where: { requesterId: session.sub },
        orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true }
    });

    const stats = {
        total: trips.length,
        pending: trips.filter(t => t.status === "Requested").length,
        approved: trips.filter(t => t.status.includes("Approved") || t.status.includes("Assigned")).length,
        completed: trips.filter(t => t.status === "Completed").length
    };



    // Upcoming trips: start date in the future and not completed/cancelled
    const upcoming = trips.filter(t => {
        const start = new Date(t.fromTime);
        return start > new Date() && t.status !== "Completed" && t.status !== "Cancelled";
    });

    return { stats, userName: user?.name || "Employee", upcoming };
}

export default async function EmployeePage() {
    const { stats, userName, upcoming } = await getData();

    return (
        <>
            <div style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
                    Welcome back, <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
                </h1>
                <p style={{ fontSize: "16px", maxWidth: "600px" }}>Here is an overview of your transport activity. You have <strong style={{ color: "var(--text-main)" }}>{upcoming.length} upcoming trips</strong> scheduled.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Total Trips" value={stats.total} index={0} />
                <StatCard title="Pending Requests" value={stats.pending} index={1} />
                <StatCard title="Approved Trips" value={stats.approved} index={2} />
                <StatCard title="Completed" value={stats.completed} index={3} />
            </div>

            <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <h2>Upcoming Trips</h2>
                    <a href="/employee/trips" className="btn btn-secondary" style={{ fontSize: "13px", padding: "8px 16px" }}>View All</a>
                </div>

                {upcoming.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-tertiary)" }}>
                        <p>No upcoming trips scheduled.</p>
                        <a href="/employee/request" className="btn btn-primary" style={{ marginTop: "16px" }}>Request a Trip</a>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                        {upcoming.map(trip => (
                            <div key={trip.id} className="card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>{trip.purpose || "Trip"}</div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span>{new Date(trip.fromTime).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                        <span style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%", opacity: 0.5 }}></span>
                                        <span>{trip.fromLoc} → {trip.toLoc}</span>
                                    </div>
                                </div>
                                <span className={`badge ${trip.status.includes("Approved") ? "success" : "warning"}`}>
                                    {trip.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
