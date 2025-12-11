"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function TripActionButtons({ tripId }: { tripId: string }) {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        // No confirmation for approval, just do it
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/trips/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tripId, decision: "approve" }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to approve");
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to approve trip");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative", zIndex: 5 }}>
                <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="btn btn-primary btn-sm"
                    style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        flexShrink: 0
                    }}
                >
                    {isSubmitting ? "..." : "Approve"}
                </button>

                <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isSubmitting}
                    className="btn btn-secondary btn-sm"
                    style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        color: "var(--danger-text)",
                        borderColor: "var(--danger-border)"
                    }}
                >
                    Reject
                </button>
            </div>

            {mounted && isRejectModalOpen && createPortal(
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 99999,
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="card" style={{
                        width: "100%",
                        maxWidth: "400px",
                        margin: "20px",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                        animation: "fadeIn 0.2s ease-out",
                        background: "var(--bg-panel)"
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Reject Request</h3>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSubmitting(true);
                                const formData = new FormData(e.currentTarget);
                                const rejectionReason = formData.get("rejectionReason") as string;

                                try {
                                    const res = await fetch("/api/trips/approve", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            tripId,
                                            decision: "reject",
                                            rejectionReason
                                        }),
                                    });

                                    if (!res.ok) {
                                        const data = await res.json().catch(() => ({}));
                                        throw new Error(data.error || "Failed to reject");
                                    }

                                    setIsRejectModalOpen(false);
                                    window.location.reload();
                                } catch (error) {
                                    console.error(error);
                                    alert("Failed to reject trip");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: "block" }}>
                                    Reason for Rejection
                                </label>
                                <textarea
                                    name="rejectionReason"
                                    rows={4}
                                    required
                                    placeholder="e.g. Trip conflicts with existing schedule..."
                                    className="input-field"
                                    style={{ width: "100%", resize: "vertical" }}
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="btn btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    style={{
                                        background: "var(--danger-bg)",
                                        color: "var(--danger-text)",
                                        borderColor: "var(--danger-border)",
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
