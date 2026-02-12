export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";


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
            <div className="page-header">
                <h1 className="welcome-text">
                    Welcome back, <span className="text-gradient">{userName}</span>
                </h1>
                <p className="subtitle">You have <strong>{upcoming.length} upcoming trips</strong> scheduled.</p>
            </div>

            <div className="stat-grid">
                <StatCard title="Total Trips" value={stats.total} index={0} />
                <StatCard title="Pending Requests" value={stats.pending} index={1} />
                <StatCard title="Approved Trips" value={stats.approved} index={2} />
                <StatCard title="Completed" value={stats.completed} index={3} />
            </div>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2>Upcoming Trips</h2>
                    <Link href="/employee/trips" className="btn btn-secondary btn-sm">View All</Link>
                </div>

                {upcoming.length === 0 ? (
                    <div className="card text-center p-8 text-muted">
                        <p className="mb-4">No upcoming trips scheduled.</p>
                        <Link href="/employee/request" className="btn btn-primary">Request a Trip</Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {upcoming.map(trip => (
                            <div key={trip.id} className="card p-6 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-lg mb-1">{trip.purpose || "Trip"}</div>
                                    <div className="text-sm text-muted flex items-center gap-2">
                                        <span>{new Date(trip.fromTime).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                        <span className="dot-separator"></span>
                                        <span>{trip.fromLoc} → {trip.toLoc}</span>
                                    </div>
                                </div>
                                <StatusBadge status={trip.status} type="trip" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
