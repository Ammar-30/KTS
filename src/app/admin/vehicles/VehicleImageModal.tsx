"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface VehicleImageModalProps {
    images: string[];
    vehicleNumber: string;
}

export default function VehicleImageModal({ images, vehicleNumber }: VehicleImageModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                background: "var(--bg-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border)"
            }}>
                🚌
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <>
            <img
                src={currentImage}
                alt={vehicleNumber}
                onClick={() => setIsOpen(true)}
                style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            />

            <Modal
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setCurrentIndex(0);
                }}
                title={`${vehicleNumber} - Images`}
                maxWidth="800px"
            >
                <div style={{ textAlign: "center" }}>
                    <img
                        src={currentImage}
                        alt={`${vehicleNumber} - Image ${currentIndex + 1}`}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "500px",
                            borderRadius: "8px",
                            border: "1px solid var(--border)"
                        }}
                    />

                    {images.length > 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16px",
                            marginTop: "20px"
                        }}>
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                className="btn"
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "14px"
                                }}
                            >
                                ← Previous
                            </button>
                            <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                                {currentIndex + 1} / {images.length}
                            </span>
                            <button
                                onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                className="btn"
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "14px"
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
