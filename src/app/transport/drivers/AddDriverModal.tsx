"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

export default function AddDriverModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{ listStyle: "none", cursor: "pointer" }}
            >
                + Add Driver
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New Driver"
            >
                <form action="/api/drivers/create" method="post">
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Full Name *</label>
                        <input name="name" required placeholder="Driver name" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-3">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>Phone Number</label>
                        <input name="phone" placeholder="0300-1234567" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <div className="form-group mb-4">
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, fontSize: "13px" }}>License Number</label>
                        <input name="licenseNo" placeholder="License number" className="input-field" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Add Driver</button>
                </form>
            </Modal>
        </>
    );
}
