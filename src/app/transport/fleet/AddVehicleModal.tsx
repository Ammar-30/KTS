"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function AddVehicleModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{ listStyle: "none", cursor: "pointer" }}
            >
                + Add Vehicle
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New Vehicle"
            >
                <form action="/api/vehicles/create" method="post" encType="multipart/form-data">
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Vehicle Number *</label>
                        <input name="number" required placeholder="LEA-1234" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Type</label>
                        <input name="type" placeholder="Sedan, SUV, Van..." className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-4">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Capacity</label>
                        <input name="capacity" type="number" placeholder="4" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-4">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Vehicle Image</label>
                        <input name="image" type="file" accept="image/*" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Vehicle</button>
                </form>
            </Modal>
        </>
    );
}
