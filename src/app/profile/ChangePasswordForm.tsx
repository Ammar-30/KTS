"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
    return (
        <form action="/api/auth/change-password" method="post">
            <PasswordField
                label="Current Password"
                name="currentPassword"
                autoComplete="current-password"
            />
            <PasswordField
                label="New Password"
                name="newPassword"
                autoComplete="new-password"
            />
            <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                autoComplete="new-password"
            />

            <div style={{ height: 16 }} />
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Update Password
            </button>
            <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-tertiary)" }}>
                Minimum 8 characters, include at least one letter and one number.
            </p>
        </form>
    );
}

function PasswordField(props: { label: string; name: string; autoComplete: string }) {
    const [show, setShow] = useState(false);

    return (
        <div className="form-group">
            <label>{props.label}</label>
            <div className="input-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                    name={props.name}
                    type={show ? "text" : "password"}
                    autoComplete={props.autoComplete}
                    required
                    className="has-icon"
                    style={{ paddingRight: 40 }}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        padding: 4,
                        cursor: "pointer",
                        color: "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        transition: "color 0.2s, background 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--primary)";
                        e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-tertiary)";
                        e.currentTarget.style.background = "transparent";
                    }}
                    title={show ? "Hide password" : "Show password"}
                >
                    {show ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
