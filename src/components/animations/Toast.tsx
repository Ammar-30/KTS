"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const toastVariants = {
    hidden: {
        opacity: 0,
        x: 300,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        x: 300,
        scale: 0.8,
        transition: {
            duration: 0.2,
        },
    },
};

const typeStyles = {
    success: {
        bg: "var(--success-bg)",
        border: "var(--success-border)",
        text: "var(--success-text)",
        icon: "✓",
    },
    error: {
        bg: "var(--danger-bg)",
        border: "var(--danger-border)",
        text: "var(--danger-text)",
        icon: "✕",
    },
    warning: {
        bg: "var(--warning-bg)",
        border: "var(--warning-border)",
        text: "var(--warning-text)",
        icon: "⚠",
    },
    info: {
        bg: "var(--info-bg)",
        border: "var(--info-border)",
        text: "var(--info-text)",
        icon: "ℹ",
    },
};

export default function Toast({
    id,
    message,
    type = "info",
    duration = 3000,
    onClose,
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const style = typeStyles[type];

    return (
        <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: style.text,
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "300px",
                maxWidth: "400px",
            }}
        >
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                {style.icon}
            </span>
            <span style={{ flex: 1, fontSize: "14px", fontWeight: 500 }}>
                {message}
            </span>
            <button
                onClick={() => onClose(id)}
                style={{
                    background: "transparent",
                    border: "none",
                    color: style.text,
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "var(--radius-sm)",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
                ✕
            </button>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        type?: ToastType;
    }>;
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: "var(--z-tooltip)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

