"use client";

import { useState } from "react";

interface DeleteVehicleButtonProps {
    vehicleId: string;
}

export default function DeleteVehicleButton({ vehicleId }: DeleteVehicleButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    if (showConfirm) {
        return (
            <div style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="btn btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                    Cancel
                </button>
                <form action="/api/admin/remove-entitled-vehicle" method="post" style={{ display: "inline-block" }}>
                    <input type="hidden" name="id" value={vehicleId} />
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            background: "var(--danger-text)",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Confirm
                    </button>
                </form>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="btn"
            style={{
                padding: "8px 16px",
                fontSize: "13px",
                background: "var(--danger-bg)",
                color: "var(--danger-text)",
                border: "1px solid var(--danger-border)",
                cursor: "pointer",
                whiteSpace: "nowrap"
            }}
        >
            Remove
        </button>
    );
}
