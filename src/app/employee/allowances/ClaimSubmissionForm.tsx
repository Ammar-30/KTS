"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDateTime } from "@/lib/utils";

type Trip = {
    id: string;
    purpose: string;
    fromTime: Date;
    toTime: Date;
    fromLoc: string;
    toLoc: string;
};

type ClaimItem = {
    id: string; // temporary ID for React keys
    claimType: string;
    amount: string;
    description: string;
};

export default function ClaimSubmissionForm({ eligibleTrips }: { eligibleTrips: Trip[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [claims, setClaims] = useState<ClaimItem[]>([
        { id: "1", claimType: "Fuel", amount: "", description: "" }
    ]);

    const addClaim = () => {
        setClaims([
            ...claims,
            { id: Math.random().toString(36).substr(2, 9), claimType: "Fuel", amount: "", description: "" }
        ]);
    };

    const removeClaim = (id: string) => {
        if (claims.length === 1) return;
        setClaims(claims.filter(c => c.id !== id));
    };

    const updateClaim = (id: string, field: keyof ClaimItem, value: string) => {
        setClaims(claims.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTripId) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tada/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tripId: selectedTripId,
                    claims: claims.map(c => ({
                        claimType: c.claimType,
                        amount: parseFloat(c.amount),
                        description: c.claimType === "Other" ? c.description : `${c.claimType} expense`
                    }))
                })
            });

            if (!res.ok) throw new Error("Failed to submit claims");

            router.refresh();
            // Reset form
            setSelectedTripId("");
            setClaims([{ id: Math.random().toString(36).substr(2, 9), claimType: "Fuel", amount: "", description: "" }]);

            // Show success message (could be improved with a toast)
            alert("Claims submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Error submitting claims. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card">
            <h2>Submit New Claim</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <div className="form-group">
                    <label>Select Trip</label>
                    <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        required
                        className="input-field"
                    >
                        <option value="">Select Completed Trip</option>
                        {eligibleTrips.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.purpose} ({fmtDateTime(t.fromTime)})
                            </option>
                        ))}
                    </select>
                    {eligibleTrips.length === 0 && (
                        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                            No eligible completed trips found.
                        </p>
                    )}
                </div>

                <div style={{ marginTop: 24, marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, fontSize: 14 }}>Expenses</label>
                </div>

                {claims.map((claim, index) => (
                    <div key={claim.id} style={{
                        background: "var(--bg-body)",
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 16,
                        border: "1px solid var(--border)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                                Claim
                            </span>
                            {claims.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeClaim(claim.id)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--danger-text)",
                                        cursor: "pointer",
                                        fontSize: 13
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Type</label>
                                <select
                                    value={claim.claimType}
                                    onChange={(e) => updateClaim(claim.id, "claimType", e.target.value)}
                                    required
                                    className="input-field"
                                >
                                    <option value="Fuel">⛽ Fuel</option>
                                    <option value="Lunch">🍽️ Lunch</option>
                                    <option value="Toll">🛣️ Toll</option>
                                    <option value="Parking">🅿️ Parking</option>
                                    <option value="Other">📋 Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Amount (PKR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    placeholder="0"
                                    value={claim.amount}
                                    onChange={(e) => updateClaim(claim.id, "amount", e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {claim.claimType === "Other" && (
                            <div className="form-group" style={{ marginTop: 16, marginBottom: 0 }}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Details of expense..."
                                    value={claim.description}
                                    onChange={(e) => updateClaim(claim.id, "description", e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addClaim}
                    className="button secondary"
                    style={{ width: "100%", marginBottom: 24, justifyContent: "center" }}
                >
                    + Add Another Expense
                </button>

                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                    <button
                        type="submit"
                        className="button primary"
                        disabled={eligibleTrips.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Claims"}
                    </button>
                </div>
            </form>
        </div>
    );
}
