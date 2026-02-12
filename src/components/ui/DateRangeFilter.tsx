"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [filterType, setFilterType] = useState<"all" | "month" | "custom">("all");
    // Initialize with current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [month, setMonth] = useState(currentMonth);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Initialize state from URL params
    useEffect(() => {
        const start = searchParams.get("startDate");
        const end = searchParams.get("endDate");

        if (start && end) {
            // Check if it matches a full month pattern (first to last day)
            const s = new Date(start);
            const e = new Date(end);
            const isFirstDay = s.getDate() === 1;
            const nextDay = new Date(e);
            nextDay.setDate(nextDay.getDate() + 1);
            const isLastDay = nextDay.getDate() === 1;

            if (isFirstDay && isLastDay && s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
                setFilterType("month");
                setMonth(start.substring(0, 7)); // YYYY-MM
            } else {
                setFilterType("custom");
                setStartDate(start);
                setEndDate(end);
            }
        } else {
            setFilterType("all");
        }
    }, [searchParams]);

    // Auto-apply filter when month is selected
    useEffect(() => {
        if (filterType === "month" && month) {
            const params = new URLSearchParams(searchParams);
            const [y, m] = month.split("-");
            const start = new Date(parseInt(y), parseInt(m) - 1, 1);
            const end = new Date(parseInt(y), parseInt(m), 0); // Last day of month

            params.set("startDate", start.toISOString().split("T")[0]);
            params.set("endDate", end.toISOString().split("T")[0]);
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [month, filterType, pathname, router]);

    // Auto-apply filter when custom dates are selected
    useEffect(() => {
        if (filterType === "custom" && startDate && endDate) {
            const params = new URLSearchParams(searchParams);
            params.set("startDate", startDate);
            params.set("endDate", endDate);
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [startDate, endDate, filterType, pathname, router]);

    return (
        <div className="card mb-4" style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, var(--card-bg) 0%, rgba(var(--primary-rgb), 0.02) 100%)",
            border: "1px solid var(--border-light)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "6px 12px",
                    background: "var(--bg-body)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-light)"
                }}>
                    <span style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>
                        📅 Period:
                    </span>
                    <select
                        value={filterType}
                        onChange={(e) => {
                            const newType = e.target.value as any;
                            setFilterType(newType);
                            setMonth("");
                            setStartDate("");
                            setEndDate("");

                            if (newType === "all") {
                                const params = new URLSearchParams(searchParams);
                                params.delete("startDate");
                                params.delete("endDate");
                                router.push(`${pathname}?${params.toString()}`);
                            }
                        }}
                        style={{
                            padding: "6px 12px",
                            paddingRight: "32px",
                            borderRadius: "6px",
                            border: "1.5px solid var(--border)",
                            background: "var(--card-bg)",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--text-main)",
                            cursor: "pointer",
                            outline: "none",
                            transition: "all 0.2s ease",
                            appearance: "none",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 10px center"
                        }}
                    >
                        <option value="all">All Time</option>
                        <option value="month">Monthly</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {filterType === "month" && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: "var(--info-bg)",
                        borderRadius: "8px",
                        border: "1px solid var(--info-text)"
                    }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--info-text)" }}>
                            Select Month:
                        </span>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1.5px solid var(--info-text)",
                                background: "white",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "var(--text-main)",
                                cursor: "pointer",
                                outline: "none",
                                transition: "all 0.2s ease"
                            }}
                        />
                    </div>
                )}

                {filterType === "custom" && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "6px 12px",
                        background: "var(--warning-bg)",
                        borderRadius: "8px",
                        border: "1px solid var(--warning-text)"
                    }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning-text)" }}>
                            From:
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1.5px solid var(--warning-text)",
                                background: "white",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "var(--text-main)",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning-text)" }}>
                            To:
                        </span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1.5px solid var(--warning-text)",
                                background: "white",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "var(--text-main)",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
