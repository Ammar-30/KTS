"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface CompleteMaintenanceModalProps {
    requestId: string;
}

export default function CompleteMaintenanceModal({ requestId }: CompleteMaintenanceModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-success"
                style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    listStyle: "none"
                }}
            >
                Complete Work
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Complete Maintenance"
            >
                <form action="/api/maintenance/complete" method="post">
                    <input type="hidden" name="requestId" value={requestId} />
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: 500,
                            fontSize: "13px"
                        }}>
                            Cost (PKR)
                        </label>
                        <input
                            name="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="Enter cost in PKR"
                            className="input-field"
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-success"
                        style={{ width: "100%" }}
                    >
                        Mark as Complete
                    </button>
                </form>
            </Modal>
        </>
    );
}
