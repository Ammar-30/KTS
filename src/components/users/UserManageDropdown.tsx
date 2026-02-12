"use client";

import { useState } from "react";
import Modal from "../ui/Modal";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
}

interface UserManageDropdownProps {
    user: User;
}

export default function UserManageDropdown({ user }: UserManageDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-secondary"
                style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    listStyle: "none",
                    whiteSpace: "nowrap"
                }}
            >
                Manage
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => { setIsOpen(false); setShowDeleteConfirm(false); }}
                title={`Manage ${user.name}`}
            >
                <h4 style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Edit User Details</h4>
                <form action="/api/admin/update-employee" method="post">
                    <input type="hidden" name="id" value={user.id} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Name</label>
                            <input name="name" defaultValue={user.name} placeholder="Name" style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Email</label>
                            <input name="email" type="email" defaultValue={user.email} placeholder="Email" style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Role</label>
                            <select name="role" defaultValue={user.role} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="TRANSPORT">Transport</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Department</label>
                            <input name="department" defaultValue={user.department || ""} placeholder="Department" style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{
                            marginTop: "8px",
                            padding: "12px 24px",
                            fontSize: "15px",
                            fontWeight: 600,
                            borderRadius: "var(--radius-md)"
                        }}>Save Changes</button>
                    </div>
                </form>

                <hr style={{
                    margin: "24px 0",
                    border: "none",
                    borderTop: "1px solid var(--border-light)"
                }} />

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn"
                        style={{
                            width: "100%",
                            background: "var(--danger-bg)",
                            color: "var(--danger-text)",
                            border: "none",
                            padding: "12px 24px",
                            fontSize: "15px",
                            fontWeight: 600,
                            borderRadius: "var(--radius-md)"
                        }}
                    >
                        Delete User
                    </button>
                ) : (
                    <div style={{ background: "var(--danger-bg)", padding: "16px", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--danger-text)", fontWeight: 500 }}>
                            Are you sure you want to delete this user?
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
                            <form action="/api/admin/delete-employee" method="post" style={{ flex: 1 }}>
                                <input type="hidden" name="id" value={user.id} />
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
