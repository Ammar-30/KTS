"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface User {
    id: string;
    name: string;
    email: string;
}

export default function AddEntitledVehicleModal({ users }: { users: User[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{ listStyle: "none", cursor: "pointer" }}
            >
                + Assign Vehicle
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Assign New Vehicle"
            >
                <form action="/api/admin/assign-entitled-vehicle" method="post">
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Vehicle Number *</label>
                        <input name="vehicleNumber" required placeholder="e.g. LEA-1234" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Vehicle Type</label>
                        <input name="vehicleType" placeholder="e.g. Sedan, SUV" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-4">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Assign To *</label>
                        <select name="userId" required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                            <option value="">Select Employee</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Assign Vehicle</button>
                </form>
            </Modal>
        </>
    );
}
