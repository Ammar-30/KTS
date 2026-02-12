"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";
import { AnimatedDropdown } from "@/components/animations";

type UserMeta = { name?: string; email?: string; role?: string };

export default function Topbar({ user }: { user?: UserMeta }) {
    if (!user) return null;

    // Use name (should always be available now from session)
    const displayName = user.name || "User";

    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Close dropdown on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const dd = document.getElementById("user-dropdown");
            const av = document.getElementById("avatar-btn");
            if (dd && av && !dd.contains(e.target as Node) && !av.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    return (
        <div className="topbar" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Profile Avatar Button */}
            <button
                id="avatar-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label="User menu"
                title={displayName}
                style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <UserAvatar name={displayName} size={40} />
            </button>

            <AnimatedDropdown
                isOpen={open}
                style={{
                    position: "absolute",
                    top: 56,
                    right: 0,
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 16,
                    width: 280,
                    boxShadow: "var(--shadow-xl)",
                    zIndex: 9999,
                }}
            >
                <div id="user-dropdown">
                    {/* User info with Avatar and Name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <UserAvatar name={displayName} size={48} />
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: 15,
                                color: "var(--text-main)",
                                marginBottom: 2
                            }}>
                                {displayName}
                            </div>
                            <div style={{
                                fontSize: 13,
                                color: "var(--text-tertiary)",
                                textTransform: "capitalize"
                            }}>
                                {user.role?.toLowerCase()}
                            </div>
                        </div>
                    </div>

                    <hr style={{
                        border: "none",
                        borderTop: "1px solid var(--border)",
                        margin: "12px 0"
                    }} />


                    {/* Change Password */}
                    <button
                        onClick={() => {
                            router.push("/profile");
                            setOpen(false);
                        }}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            color: "var(--text-secondary)",
                            background: "transparent",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            borderRadius: "var(--radius-md)",
                            fontSize: 14,
                            fontWeight: 500,
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-body)";
                            e.currentTarget.style.color = "var(--primary)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                    >
                        🔒 Change Password
                    </button>

                    <hr style={{
                        border: "none",
                        borderTop: "1px solid var(--border)",
                        margin: "12px 0"
                    }} />

                    {/* Logout */}
                    <form action="/api/auth/logout" method="post">
                        <button
                            type="submit"
                            className="button danger"
                            style={{
                                width: "100%",
                                padding: "10px 16px",
                                borderRadius: "var(--radius-md)",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </AnimatedDropdown>
        </div>
    );
}
