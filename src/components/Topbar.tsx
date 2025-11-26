"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type UserMeta = { name?: string; email?: string; role?: string };

export default function Topbar({ user }: { user?: UserMeta }) {
    if (!user || (!user.name && !user.email)) return null;

    const [open, setOpen] = useState(false);
    const router = useRouter();

    const initial =
        user.name?.trim()?.[0]?.toUpperCase() ??
        user.email?.trim()?.[0]?.toUpperCase() ??
        "";

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
            <div style={{ flex: 1 }} />

            {/* Profile Avatar */}
            <button
                id="avatar-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label="User menu"
                title="User menu"
                style={{
                    background: "#1f2937",
                    color: "#fff",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    border: "none",
                    marginLeft: 8,
                    cursor: "pointer",
                }}
            >
                {initial}
            </button>

            {open && (
                <div
                    id="user-dropdown"
                    style={{
                        position: "absolute",
                        top: 56,
                        right: 24,
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        padding: 12,
                        width: 260,
                        boxShadow: "var(--shadow-1)",
                        zIndex: 100,
                    }}
                >
                    {/* User info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div
                            style={{
                                background: "#1f2937",
                                color: "#fff",
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 13,
                            }}
                        >
                            {initial}
                        </div>
                        <div style={{ color: "var(--text)", fontSize: 13, opacity: 0.9 }}>{user.email}</div>
                    </div>

                    <hr style={{ borderColor: "var(--line)", margin: "8px 0" }} />

                    {/* Admin Dashboard Link */}
                    {user.role === "ADMIN" && (
                        <>
                            <button
                                onClick={() => {
                                    router.push("/admin");
                                    setOpen(false);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    color: "var(--text)",
                                    background: "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                            >
                                Admin Dashboard
                            </button>
                            <hr style={{ borderColor: "var(--line)", margin: "8px 0" }} />
                        </>
                    )}

                    {/* Dark Mode Toggle INSIDE dropdown */}
                    <div style={{ marginBottom: 10 }}>
                        <ThemeToggle />
                    </div>

                    {/* Change Password */}
                    <button
                        onClick={() => {
                            router.push("/profile");
                            setOpen(false);
                        }}
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            color: "var(--text)",
                            background: "transparent",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            borderRadius: 8,
                            fontSize: 14,
                        }}
                    >
                        Change Password
                    </button>

                    {/* Logout */}
                    <form action="/api/auth/logout" method="post" style={{ marginTop: 8 }}>
                        <button
                            type="submit"
                            className="button danger"
                            style={{
                                width: "100%",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "8px 0",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 14,
                            }}
                        >
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
