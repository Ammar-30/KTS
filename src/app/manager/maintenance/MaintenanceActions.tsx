"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface MaintenanceActionsProps {
    requestId: string;
}

export default function MaintenanceActions({ requestId }: MaintenanceActionsProps) {
    const router = useRouter();
    const [isRejecting, setIsRejecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = async () => {
        // No confirmation, just approve
        setIsLoading(true);
        try {
            const res = await fetch("/api/maintenance/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    decision: "approve"
                })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                console.error("Failed to update request");
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.error?.message || "Failed to approve request. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/maintenance/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    decision: "reject",
                    rejectionReason
                })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                console.error("Failed to update request");
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.error?.message || "Failed to reject request. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "nowrap", position: "relative", zIndex: 5 }}>
                <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{
                        padding: "8px 16px",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        flexShrink: 0
                    }}
                >
                    {isLoading ? "..." : "Approve"}
                </button>
                <button
                    onClick={() => setIsRejecting(true)}
                    disabled={isLoading}
                    className="btn btn-secondary"
                    style={{
                        padding: "8px 16px",
                        fontSize: 13,
                        color: "var(--danger-text)",
                        borderColor: "var(--danger-border)",
                        whiteSpace: "nowrap",
                        flexShrink: 0
                    }}
                >
                    Reject
                </button>
            </div>

            {mounted && isRejecting && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 99999,
                        backdropFilter: "blur(4px)"
                    }}
                    onClick={() => setIsRejecting(false)}
                >
                    <div
                        className="card"
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            margin: "20px",
                            padding: "24px",
                            position: "relative",
                            zIndex: 10000,
                            animation: "cardEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            background: "var(--bg-panel)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: "8px" }}>Reject Request</h3>
                        <p style={{ marginBottom: "20px", color: "var(--text-secondary)" }}>Please provide a reason for rejecting this maintenance request.</p>

                        <div className="form-group" style={{ marginBottom: "24px" }}>
                            <label htmlFor="rejectionReason">Rejection Reason</label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                placeholder="e.g. Not urgent, can wait until next service..."
                                autoFocus
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                onClick={() => setIsRejecting(false)}
                                className="btn btn-secondary"
                                disabled={isLoading}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn"
                                disabled={isLoading || !rejectionReason.trim()}
                                type="button"
                                style={{
                                    background: "var(--danger-bg)",
                                    color: "var(--danger-text)",
                                    border: "1px solid var(--danger-border)"
                                }}
                            >
                                {isLoading ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
