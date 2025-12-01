"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDateTime } from "@lib/utils";
import { AnimatedDropdown, SkeletonLoader } from "@/components/animations";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date | string;
}

export default function NotificationCentre() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const dd = document.getElementById("notification-dropdown");
            const btn = document.getElementById("notification-btn");
            if (dd && btn && !dd.contains(e.target as Node) && !btn.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("click", onClick);
            return () => document.removeEventListener("click", onClick);
        }
    }, [open]);

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("[NotificationCentre] Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: string) {
        try {
            await fetch("/api/notifications/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("[NotificationCentre] Error marking as read:", error);
        }
    }

    async function markAllAsRead() {
        try {
            await fetch("/api/notifications/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("[NotificationCentre] Error marking all as read:", error);
        }
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            setOpen(false);
        }
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case "TRIP_REQUEST":
            case "TRIP_APPROVED":
                return "🚗";
            case "TRIP_REJECTED":
                return "❌";
            case "TADA_REQUEST":
            case "TADA_APPROVED":
                return "💰";
            case "TADA_REJECTED":
                return "❌";
            case "MAINTENANCE_REQUEST":
            case "MAINTENANCE_APPROVED":
                return "🔧";
            case "MAINTENANCE_REJECTED":
                return "❌";
            case "VEHICLE_ASSIGNED":
                return "✅";
            default:
                return "🔔";
        }
    }

    return (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button
                id="notification-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    borderRadius: "var(--radius-md)",
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-body)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "var(--danger-text)",
                            color: "white",
                            borderRadius: "var(--radius-full)",
                            fontSize: "11px",
                            fontWeight: 600,
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 4px",
                            border: "2px solid var(--bg-panel)",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatedDropdown
                isOpen={open}
                style={{
                    position: "absolute",
                    top: "56px",
                    right: 0,
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    width: "380px",
                    maxHeight: "500px",
                    boxShadow: "var(--shadow-xl)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    id="notification-dropdown"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "500px",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--primary)",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "var(--radius-sm)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--primary-light)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div
                        style={{
                            overflowY: "auto",
                            maxHeight: "400px",
                        }}
                    >
                        {loading ? (
                            <div
                                style={{
                                    padding: "32px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                }}
                            >
                                <SkeletonLoader height={60} count={3} />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: "32px",
                                    textAlign: "center",
                                    color: "var(--text-tertiary)",
                                }}
                            >
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: "16px 20px",
                                        borderBottom: "1px solid var(--border)",
                                        cursor: "pointer",
                                        background: notification.read
                                            ? "transparent"
                                            : "var(--primary-light)",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "var(--bg-body)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = notification.read
                                            ? "transparent"
                                            : "var(--primary-light)";
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "20px",
                                                flexShrink: 0,
                                                marginTop: "2px",
                                            }}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    gap: "8px",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                <h4
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "14px",
                                                        fontWeight: notification.read ? 500 : 600,
                                                        color: "var(--text-main)",
                                                    }}
                                                >
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span
                                                        style={{
                                                            width: "8px",
                                                            height: "8px",
                                                            borderRadius: "50%",
                                                            background: "var(--primary)",
                                                            flexShrink: 0,
                                                            marginTop: "4px",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "13px",
                                                    color: "var(--text-secondary)",
                                                    lineHeight: "1.5",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {notification.message}
                                            </p>
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    color: "var(--text-tertiary)",
                                                }}
                                            >
                                                {fmtDateTime(notification.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </AnimatedDropdown>
        </div>
    );
}

