"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type UserRole = "ADMIN" | "EMPLOYEE" | "MANAGER" | "TRANSPORT";

interface SidebarProps {
    userRole?: string;
    userName?: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
    const pathname = usePathname();
    const role = (userRole as UserRole) || "EMPLOYEE";

    const links = [
        { label: "Dashboard", href: `/${role.toLowerCase()}`, roles: ["ADMIN", "EMPLOYEE", "MANAGER", "TRANSPORT"] },
        { label: "Allowances", href: "/manager/allowances", roles: ["MANAGER"] },
        { label: "Maintenance", href: "/manager/maintenance", roles: ["MANAGER"] },
        { label: "My Trips", href: "/employee/trips", roles: ["EMPLOYEE"] },
        { label: "Allowances", href: "/employee/allowances", roles: ["EMPLOYEE"] },
        { label: "Maintenance", href: "/employee/maintenance", roles: ["EMPLOYEE"] },
        { label: "Request Trip", href: "/employee/request", roles: ["EMPLOYEE"] },
        { label: "Manage Employees", href: "/admin/employees", roles: ["ADMIN"] },
        { label: "Trip Management", href: "/admin/trips", roles: ["ADMIN"] },
        { label: "TADA Management", href: "/admin/tada", roles: ["ADMIN"] },
        { label: "Entitled Vehicles", href: "/admin/entitled-vehicles", roles: ["ADMIN"] },
        { label: "Vehicles", href: "/admin/vehicles", roles: ["ADMIN"] },
        { label: "Maintenance", href: "/admin/maintenance", roles: ["ADMIN"] },
        { label: "Manage Fleet", href: "/transport/fleet", roles: ["TRANSPORT"] },
        { label: "Manage Drivers", href: "/transport/drivers", roles: ["TRANSPORT"] },
        { label: "Maintenance", href: "/transport/maintenance", roles: ["TRANSPORT"] },
        { label: "Settings", href: "/profile", roles: ["ADMIN", "EMPLOYEE", "MANAGER", "TRANSPORT"] },
    ];

    const filteredLinks = links.filter((link) => link.roles.includes(role));

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
                width: "var(--sidebar-width)",
                background: "#1e1b4b", // Deep indigo/slate
                color: "white",
                height: "calc(100vh - 32px)",
                position: "fixed",
                left: 16,
                top: 16,
                display: "flex",
                flexDirection: "column",
                zIndex: 50,
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                overflow: "hidden"
            }}
        >
            {/* Logo Area */}
            <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "white", padding: "4px", borderRadius: "8px" }}>
                        <Image src="/Kips_Logo.png" alt="KIPS Logo" width={40} height={32} style={{ borderRadius: "4px" }} unoptimized />
                    </div>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em", display: "block", lineHeight: 1 }}>KIPS</span>
                        <span style={{ fontSize: "12px", opacity: 0.6, fontWeight: 500, letterSpacing: "0.05em" }}>TRANSPORT</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }}>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredLinks.map((link, index) => {
                        const isActive = pathname === link.href;
                        return (
                            <motion.li
                                key={link.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.05,
                                    ease: [0.2, 0.8, 0.2, 1],
                                }}
                            >
                                <Link
                                    href={link.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px 16px",
                                        borderRadius: "12px",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        color: isActive ? "white" : "rgba(255,255,255,0.6)",
                                        background: isActive ? "var(--primary)" : "transparent",
                                        textDecoration: "none",
                                        transition: "all var(--duration-medium) var(--ease-spring)",
                                        boxShadow: isActive ? "0 4px 12px rgba(79, 70, 229, 0.4)" : "none"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "transparent";
                                        }
                                    }}
                                >
                                    {link.label}
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile Snippet (Bottom) */}
            <div style={{ padding: "24px", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px" }}>
                        {userName?.charAt(0) || "U"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>{userName || role}</div>
                        <div style={{ fontSize: "11px", opacity: 0.6, textTransform: "capitalize" }}>
                            {role.toLowerCase()}
                        </div>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
