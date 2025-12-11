"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface ReportIssueModalProps {
    requestId: string;
}

export default function ReportIssueModal({ requestId }: ReportIssueModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn"
                style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    background: "var(--warning-bg)",
                    color: "var(--warning-text)",
                    border: "1px solid var(--warning-border)",
                    cursor: "pointer"
                }}
            >
                Report Issue
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Report Maintenance Issue"
            >
                <p style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginBottom: "16px"
                }}>
                    If you are not satisfied with the maintenance work, please describe the issue below.
                </p>
                <form action="/api/maintenance/report-issue" method="post">
                    <input type="hidden" name="requestId" value={requestId} />
                    <div style={{ marginBottom: "16px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: 500,
                            fontSize: "13px"
                        }}>
                            Issue Description
                        </label>
                        <textarea
                            name="issueDescription"
                            required
                            rows={4}
                            placeholder="Describe what's wrong with the maintenance work..."
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                resize: "vertical",
                                fontSize: "14px"
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            width: "100%",
                            background: "var(--warning-bg)",
                            color: "var(--warning-text)",
                            border: "1px solid var(--warning-border)",
                            padding: "10px 20px",
                            fontWeight: 600
                        }}
                    >
                        Submit Report
                    </button>
                </form>
            </Modal>
        </>
    );
}
