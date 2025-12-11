"use client";

import { useEffect, useRef, useState } from "react";
import DateTimePicker from "@/components/DateTimePicker";

// Icons
const Icons = {
    Purpose: () => (
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Location: () => (
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Calendar: () => (
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Building: () => (
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    UserGroup: () => (
        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
};

type EntitledVehicle = {
    id: string;
    vehicleNumber: string;
    vehicleType: string | null;
};

export default function RequestForm({ department, entitledVehicles = [] }: { department?: string, entitledVehicles?: EntitledVehicle[] }) {
    const [fromTime, setFromTime] = useState<string>("");
    const [toTime, setToTime] = useState<string>("");
    const [stops, setStops] = useState<string[]>([]);
    const [passengers, setPassengers] = useState<string[]>([]);
    const [category, setCategory] = useState("FLEET");

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (fromTime && toTime && toTime < fromTime) {
            e.preventDefault();
            alert("Return time must be the same as or after the departure time.");
            return;
        }
    };

    const addStop = () => setStops([...stops, ""]);
    const removeStop = (index: number) => setStops(stops.filter((_, i) => i !== index));
    const updateStop = (index: number, value: string) => {
        const newStops = [...stops];
        newStops[index] = value;
        setStops(newStops);
    };

    const addPassenger = () => setPassengers([...passengers, ""]);
    const removePassenger = (index: number) => setPassengers(passengers.filter((_, i) => i !== index));
    const updatePassenger = (index: number, value: string) => {
        const newPassengers = [...passengers];
        newPassengers[index] = value;
        setPassengers(newPassengers);
    };

    return (
        <form action="/api/trips/create" method="post" onSubmit={onSubmit}>
            <input type="hidden" name="stops" value={JSON.stringify(stops)} />

            <div className="form-group">
                <label>Purpose of Trip</label>
                <div className="input-wrapper">
                    <Icons.Purpose />
                    <input name="purpose" required placeholder="e.g. Client meeting..." className="has-icon" />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ marginBottom: 12, display: "block" }}>Passengers Traveling (Optional)</label>
                {passengers.map((name, index) => (
                    <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => updatePassenger(index, e.target.value)}
                            placeholder={`Passenger ${index + 1} Name`}
                            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                        />
                        <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid var(--danger-border)",
                                background: "var(--danger-bg)",
                                color: "var(--danger-text)",
                                cursor: "pointer"
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addPassenger}
                    className="button secondary"
                    style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                >
                    + Add Passenger
                </button>
                <input type="hidden" name="passengerNames" value={JSON.stringify(passengers.filter(p => p.trim() !== ""))} />
            </div>


            <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ marginBottom: 12, display: "block" }}>Vehicle Category</label>
                <div style={{ display: "flex", gap: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="vehicleCategory"
                            value="FLEET"
                            checked={category === "FLEET"}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <span>Fleet Vehicle</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="vehicleCategory"
                            value="PERSONAL"
                            checked={category === "PERSONAL"}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <span>Personal Vehicle</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="radio"
                            name="vehicleCategory"
                            value="ENTITLED"
                            checked={category === "ENTITLED"}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <span>Officially Entitled</span>
                    </label>
                </div>
            </div>

            {category === "PERSONAL" && (
                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Vehicle Details</label>
                    <div className="input-wrapper">
                        <input
                            name="personalVehicleDetails"
                            required
                            placeholder="e.g. Honda Civic LEA-1234"
                            className="input-field"
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                        />
                    </div>
                </div>
            )}

            {category === "ENTITLED" && (
                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>Entitled Vehicle</label>
                    {entitledVehicles.length > 0 ? (
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={`${entitledVehicles[0].vehicleNumber} ${entitledVehicles[0].vehicleType ? `(${entitledVehicles[0].vehicleType})` : ""}`}
                                disabled
                                className="input-field"
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-body)", color: "var(--text-secondary)" }}
                            />
                            <input type="hidden" name="entitledVehicleId" value={entitledVehicles[0].id} />
                        </div>
                    ) : (
                        <p style={{ color: "var(--danger-text)", fontSize: "13px", marginTop: "4px" }}>
                            No entitled vehicles assigned to you. Please contact admin.
                        </p>
                    )}
                </div>
            )}

            <div className="form-group">
                <label>From Location</label>
                <div className="input-wrapper">
                    <Icons.Location />
                    <input name="fromLoc" required placeholder="Starting point" className="has-icon" />
                </div>
            </div>
            <div className="form-group">
                <label>To Location</label>
                <div className="input-wrapper">
                    <Icons.Location />
                    <input name="toLoc" required placeholder="Destination" className="has-icon" />
                </div>
            </div>

            {/* Stops Section */}
            {stops.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <label style={{ marginBottom: 8, display: 'block' }}>Stops</label>
                    {stops.map((stop, index) => (
                        <div key={index} className="input-wrapper" style={{ marginBottom: 8 }}>
                            <Icons.Location />
                            <input
                                value={stop}
                                onChange={(e) => updateStop(index, e.target.value)}
                                placeholder={`Stop ${index + 1}`}
                                className="has-icon"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => removeStop(index)}
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    padding: 4
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <button
                    type="button"
                    onClick={addStop}
                    className="button secondary"
                    style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, marginRight: 6 }}>
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Stop
                </button>
            </div>

            <div className="form-group">
                <label>Departure Time</label>
                <div className="input-wrapper">
                    <Icons.Calendar />
                    <DateTimePicker
                        name="fromTime"
                        value={fromTime}
                        onChange={(value) => {
                            setFromTime(value);
                            // Update toTime min if needed
                            if (toTime && value > toTime) {
                                setToTime(value);
                            }
                        }}
                        required
                        placeholder="dd/mm/yyyy, --:--"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Return Time</label>
                <div className="input-wrapper">
                    <Icons.Calendar />
                    <DateTimePicker
                        name="toTime"
                        value={toTime}
                        onChange={setToTime}
                        min={fromTime || undefined}
                        required
                        placeholder="dd/mm/yyyy, --:--"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Company</label>
                <div className="input-wrapper">
                    <Icons.Building />
                    <select name="company" required className="has-icon" defaultValue="KIPS_PREPS">
                        <option value="KIPS_PREPS">KIPS Preps</option>
                        <option value="TETB">TETB</option>
                        <option value="QUALITY_BRANDS">Quality Brands</option>
                        <option value="KDP">KDP</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label>Department</label>
                <div className="input-wrapper">
                    <Icons.UserGroup />
                    <input
                        name="department_display"
                        value={department || "Not Assigned"}
                        disabled
                        className="has-icon"
                        style={{ opacity: 0.7, cursor: "not-allowed", background: "var(--bg)" }}
                    />
                </div>
            </div>

            <div style={{ height: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="button primary">
                    Submit Request
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </form >
    );
}
