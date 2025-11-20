"use client";

import { useEffect, useState } from "react";

type Driver = { id: string; name: string };
type Vehicle = { id: string; number: string };

export function AssignForm({
                               tripId,
                               fromTimeISO,
                               toTimeISO
                           }: {
    tripId: string;
    fromTimeISO: string; // pass ISO strings from server
    toTimeISO: string;
}) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErr(null);
                const url = `/api/transport/available?fromTime=${encodeURIComponent(
                    fromTimeISO
                )}&toTime=${encodeURIComponent(toTimeISO)}`;
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    throw new Error(j?.error || `HTTP ${res.status}`);
                }
                const j = await res.json();
                setDrivers(j.drivers || []);
                setVehicles(j.vehicles || []);
            } catch (e: any) {
                setErr(e?.message || "Failed to load availability");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [fromTimeISO, toTimeISO]);

    if (loading) return <span className="helper">Loading…</span>;
    if (err) return <span className="error">Error: {err}</span>;

    const noOptions = drivers.length === 0 || vehicles.length === 0;

    return (
        <form action="/api/trips/assign" method="post" style={{ minWidth: 260 }}>
            <input type="hidden" name="tripId" value={tripId} />
            <div className="row">
                <select name="driverId" required defaultValue="" disabled={drivers.length === 0}>
                    <option value="" disabled>
                        {drivers.length ? "Select driver" : "No drivers free"}
                    </option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <select name="vehicleId" required defaultValue="" disabled={vehicles.length === 0}>
                    <option value="" disabled>
                        {vehicles.length ? "Select vehicle" : "No vehicles free"}
                    </option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.number}</option>
                    ))}
                </select>
            </div>
            <div style={{ height: 8 }} />
            <button disabled={noOptions}>Assign</button>
        </form>
    );
}
