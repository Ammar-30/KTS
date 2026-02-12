"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function AddEmployeeModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{ listStyle: "none", cursor: "pointer" }}
            >
                + Add Employee
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add New Employee"
            >
                <form action="/api/admin/create-employee" method="post" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Name *</label>
                        <input name="name" required placeholder="Full Name" />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Email *</label>
                        <input name="email" type="email" required placeholder="email@example.com" />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Password *</label>
                        <input name="password" type="password" required placeholder="Initial password" />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px" }}>
                        <label>Role</label>
                        <select name="role" defaultValue="EMPLOYEE" style={{
                            width: "100%",
                            fontWeight: 500
                        }}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: "24px" }}>
                        <label>Department</label>
                        <input name="department" placeholder="e.g. IT, HR, Sales" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{
                        width: "100%",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: 600
                    }}>Create User</button>
                </form>
            </Modal>
        </>
    );
}
