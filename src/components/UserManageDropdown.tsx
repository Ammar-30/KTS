"use client";

import { useEffect, useRef, useState } from "react";

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
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isOpen || !dropdownRef.current || !summaryRef.current) return;

        const calculatePosition = () => {
            const summary = summaryRef.current;
            const dropdown = dropdownRef.current;
            if (!summary || !dropdown) return;

            const rect = summary.getBoundingClientRect();
            const dropdownWidth = 380;
            const viewportWidth = window.innerWidth;
            const spaceRight = viewportWidth - rect.right;

            dropdown.style.position = 'fixed';
            dropdown.style.top = `${Math.max(8, rect.bottom + 8)}px`;
            
            // Position relative to button's right edge, but ensure it doesn't go off-screen
            const leftPosition = rect.right - dropdownWidth;
            if (leftPosition < 8) {
                // Not enough space on left, align to left edge with padding
                dropdown.style.left = '8px';
                dropdown.style.right = 'auto';
            } else if (spaceRight < dropdownWidth) {
                // Not enough space on right, align to right edge with padding
                dropdown.style.right = '8px';
                dropdown.style.left = 'auto';
            } else {
                // Enough space, align to button's right edge
                dropdown.style.right = `${viewportWidth - rect.right}px`;
                dropdown.style.left = 'auto';
            }
            
            dropdown.style.zIndex = '10001';
        };

        calculatePosition();
        window.addEventListener('scroll', calculatePosition, true);
        window.addEventListener('resize', calculatePosition);

        return () => {
            window.removeEventListener('scroll', calculatePosition, true);
            window.removeEventListener('resize', calculatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (detailsRef.current.hasAttribute('open')) {
                    detailsRef.current.removeAttribute('open');
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleToggle = () => {
        const details = detailsRef.current;
        if (details) {
            setIsOpen(details.open);
        }
    };

    return (
        <details 
            ref={detailsRef}
            onToggle={handleToggle}
            style={{ position: "relative", display: "inline-block" }}
        >
            <summary 
                ref={summaryRef}
                className="btn btn-secondary" 
                style={{ 
                    padding: "8px 16px", 
                    fontSize: "13px", 
                    cursor: "pointer", 
                    listStyle: "none", 
                    whiteSpace: "nowrap" 
                }}
            >
                Manage ▾
            </summary>
            <div 
                ref={dropdownRef}
                className="dropdown-menu dropdown-content dropdown-right" 
                style={{ 
                    width: "380px", 
                    padding: "24px", 
                    background: "var(--bg-panel)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-xl)",
                    border: "1px solid var(--border-light)",
                    zIndex: 10001,
                    display: isOpen ? "block" : "none"
                }}
            >
                <h4 style={{ 
                    margin: "0 0 20px 0", 
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2"
                }}>Edit User</h4>
                <form action="/api/admin/update-employee" method="post" style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "0",
                    width: "100%"
                }}>
                    <input type="hidden" name="id" value={user.id} />
                    <div className="form-group" style={{ marginBottom: "20px", width: "100%" }}>
                        <label style={{ display: "block", marginBottom: "8px" }}>Name</label>
                        <input 
                            name="name" 
                            defaultValue={user.name} 
                            placeholder="Name"
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px", width: "100%" }}>
                        <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            defaultValue={user.email} 
                            placeholder="Email"
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: "20px", width: "100%" }}>
                        <label style={{ display: "block", marginBottom: "8px" }}>Role</label>
                        <select 
                            name="role" 
                            defaultValue={user.role} 
                            style={{ 
                                fontWeight: 500,
                                width: "100%",
                                boxSizing: "border-box"
                            }}
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: "24px", width: "100%" }}>
                        <label style={{ display: "block", marginBottom: "8px" }}>Department</label>
                        <input 
                            name="department" 
                            defaultValue={user.department || ""} 
                            placeholder="Department"
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ 
                        width: "100%",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: 600,
                        boxSizing: "border-box"
                    }}>Save Changes</button>
                </form>

                <hr style={{ 
                    margin: "24px 0", 
                    border: "none", 
                    borderTop: "1px solid var(--border-light)"
                }} />
                <form action="/api/admin/delete-employee" method="post" style={{ width: "100%" }}>
                    <input type="hidden" name="id" value={user.id} />
                    <button type="submit" className="btn" style={{ 
                        width: "100%", 
                        background: "var(--danger-bg)", 
                        color: "var(--danger-text)", 
                        border: "none",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: 600,
                        borderRadius: "var(--radius-md)",
                        boxSizing: "border-box"
                    }}>
                        Delete User
                    </button>
                </form>
            </div>
        </details>
    );
}

