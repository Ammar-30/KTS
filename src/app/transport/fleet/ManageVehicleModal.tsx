"use client";

import { useState, useRef } from "react";
import Modal from "@/components/Modal";

interface Vehicle {
    id: string;
    number: string;
    type: string | null;
    capacity: number | null;
    active: boolean;
}

export default function ManageVehicleModal({ vehicle }: { vehicle: Vehicle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const deleteFormRef = useRef<HTMLFormElement>(null);

    const handleDeleteConfirm = () => {
        deleteFormRef.current?.submit();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
                Manage
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={`Manage Vehicle ${vehicle.number}`}
            >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Edit Vehicle</h4>
                <form action="/api/vehicles/update" method="post">
                    <input type="hidden" name="id" value={vehicle.id} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Vehicle Number</label>
                            <input name="number" defaultValue={vehicle.number} placeholder="Number" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Type</label>
                            <input name="type" defaultValue={vehicle.type || ""} placeholder="Type" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Capacity</label>
                            <input name="capacity" type="number" defaultValue={vehicle.capacity || ""} placeholder="Capacity" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Status</label>
                            <select name="active" defaultValue={vehicle.active ? "true" : "false"} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "4px" }}>Save Changes</button>
                    </div>
                </form>

                <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn"
                        style={{ width: "100%", background: "var(--danger-bg)", color: "var(--danger-text)", border: "none" }}
                    >
                        Delete Vehicle
                    </button>
                ) : (
                    <div style={{ background: "var(--danger-bg)", padding: "16px", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--danger-text)", fontWeight: 500 }}>
                            Are you sure you want to delete this vehicle?
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <form ref={deleteFormRef} action="/api/vehicles/delete" method="post" style={{ flex: 1 }}>
                                <input type="hidden" name="id" value={vehicle.id} />
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{ width: "100%", background: "var(--danger-text)", color: "white", border: "none" }}
                                >
                                    Yes, Delete
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
