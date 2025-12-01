"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificationCentre from "./NotificationCentre";
import { PageTransition } from "./animations";
import { ReactNode } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
    user: { name?: string; email?: string; role?: string };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
    return (
        <div className="dashboard-container">
            <Sidebar userRole={user.role} userName={user.name} />
            <div className="main-content">
                {/* Header Area */}
                <header
                    style={{
                        height: "var(--header-height)",
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid var(--border-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 40px",
                        position: "sticky",
                        top: 0,
                        zIndex: 40,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "20px", fontFamily: "Outfit, sans-serif" }}>Dashboard</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        {/* Notification Centre */}
                        <NotificationCentre />
                        {/* We can reuse Topbar or parts of it here for the user dropdown */}
                        <Topbar user={user} />
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="page-content">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
