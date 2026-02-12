"use client";

import { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";

interface Driver {
    id: string;
    name: string;
    phone: string | null;
    licenseNo: string | null;
    active: boolean;
}

export default function ManageDriverModal({ driver }: { driver: Driver }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
            >
                Manage
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={`Manage Driver ${driver.name}`}
            >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>Edit Driver</h4>
                <form action="/api/drivers/update" method="post">
                    <input type="hidden" name="id" value={driver.id} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Name</label>
                            <input name="name" defaultValue={driver.name} placeholder="Name" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Phone</label>
                            <input name="phone" defaultValue={driver.phone || ""} placeholder="Phone" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>License No</label>
                            <input name="licenseNo" defaultValue={driver.licenseNo || ""} placeholder="License No" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px", display: "block" }}>Status</label>
                            <select name="active" defaultValue={driver.active ? "true" : "false"} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "4px" }}>Save Changes</button>
                    </div>
                </form>

                {driver.active && (
                    <>
                        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />

                        {!showDeactivateConfirm ? (
                            <button
                                type="button"
                                onClick={() => setShowDeactivateConfirm(true)}
                                className="btn"
                                style={{ width: "100%", background: "var(--danger-bg)", color: "var(--danger-text)", border: "none" }}
                            >
                                Deactivate Driver
                            </button>
                        ) : (
                            <div style={{ background: "var(--danger-bg)", padding: "16px", borderRadius: "8px" }}>
                                <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--danger-text)", fontWeight: 500 }}>
                                    Are you sure you want to deactivate this driver?
                                </p>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeactivateConfirm(false)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <form action="/api/drivers/delete" method="post" style={{ flex: 1 }}>
                                        <input type="hidden" name="id" value={driver.id} />
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{ width: "100%", background: "var(--danger-text)", color: "white", border: "none" }}
                                        >
                                            Yes, Deactivate
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
}
