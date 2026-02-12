"use client";

import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    index?: number;
}

export default function StatCard({ title, value, icon, trend, trendUp, index = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
            }}
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}
            whileHover={{ scale: 1.02, y: -4 }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>{title}</span>
                {icon && <div style={{ color: "var(--primary)", opacity: 0.8 }}>{icon}</div>}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-main)" }}>{value}</div>
            {trend && (
                <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{
                        color: trendUp ? "var(--success-text)" : "var(--danger-text)",
                        background: trendUp ? "var(--success-bg)" : "var(--danger-bg)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600
                    }}>
                        {trend}
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>vs last month                    </span>
                </div>
            )}
        </motion.div>
    );
}
