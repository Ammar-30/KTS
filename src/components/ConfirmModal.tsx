"use client";

import { useState } from "react";
import Modal from "./Modal";

interface ConfirmModalProps {
    trigger: React.ReactNode;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: "danger" | "primary";
    onConfirm: () => void;
}

export default function ConfirmModal({
    trigger,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmStyle = "danger",
    onConfirm
}: ConfirmModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirm();
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)} style={{ display: "contents" }}>
                {trigger}
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
            >
                <p style={{
                    color: "var(--text-secondary)",
                    marginBottom: "24px",
                    fontSize: "14px",
                    lineHeight: "1.5"
                }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-secondary"
                        style={{ padding: "10px 20px" }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className={`btn ${confirmStyle === "danger" ? "btn-danger" : "btn-primary"}`}
                        style={{ padding: "10px 20px" }}
                    >
                        {confirmText}
                    </button>
                </div>
            </Modal>
        </>
    );
}
