"use client";

import { useEffect, useRef } from "react";

export default function RequestForm() {
    const fromRef = useRef<HTMLInputElement>(null);
    const toRef = useRef<HTMLInputElement>(null);

    // Keep "toTime" min >= "fromTime"
    useEffect(() => {
        const fromEl = fromRef.current!;
        const toEl = toRef.current!;

        const syncMin = () => {
            if (!fromEl.value) return;
            toEl.min = fromEl.value;
            if (toEl.value && toEl.value < fromEl.value) {
                toEl.value = fromEl.value;
            }
        };

        fromEl.addEventListener("change", syncMin);
        fromEl.addEventListener("input", syncMin);
        syncMin();
        return () => {
            fromEl.removeEventListener("change", syncMin);
            fromEl.removeEventListener("input", syncMin);
        };
    }, []);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const fromEl = fromRef.current!;
        const toEl = toRef.current!;
        if (fromEl.value && toEl.value && toEl.value < fromEl.value) {
            e.preventDefault();
            alert("End time must be the same as or after the start time.");
            toEl.focus();
        }
    };

    return (
        <form action="/api/trips/create" method="post" onSubmit={onSubmit}>
            <label>Purpose</label>
            <input name="purpose" required />

            <div className="row">
                <div>
                    <label>From</label>
                    <input name="fromLoc" required />
                </div>
                <div>
                    <label>To</label>
                    <input name="toLoc" required />
                </div>
            </div>

            <div className="row">
                <div>
                    <label>From Time</label>
                    <input ref={fromRef} name="fromTime" type="datetime-local" required />
                    {/* Optional tiny helper link (remove if you don't want it) */}
                    <a
                        href="https://www.timeanddate.com/calendar/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-block",
                            marginTop: 6,
                            fontSize: 12,
                            color: "var(--primary)",
                            textDecoration: "underline",
                        }}
                    >
                    </a>
                </div>

                <div>
                    <label>To Time</label>
                    <input ref={toRef} name="toTime" type="datetime-local" required />
                    {/* Optional tiny helper link (remove if you don't want it) */}
                    <a
                        href="https://www.timeanddate.com/calendar/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-block",
                            marginTop: 6,
                            fontSize: 12,
                            color: "var(--primary)",
                            textDecoration: "underline",
                        }}
                    >
                    </a>
                </div>
            </div>

            <div className="row">
                <div>
                    <label>Company</label>
                    <select name="company" required>
                        <option value="KIPS_PREPS">KIPS Preps</option>
                        <option value="TETB">TETB</option>
                        <option value="QUALITY_BRANDS">Quality Brands</option>
                        <option value="KDP">KDP</option>
                    </select>
                </div>
                <div>
                    <label>Department (optional)</label>
                    <input name="department" placeholder="e.g., Academics, HR" />
                </div>
            </div>

            <div style={{ height: 8 }} />
            <button type="submit" className="button">Submit Request</button>
        </form>
    );
}
