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

            <div style={{ height: 8 }} />
            <button type="submit">Update Password</button>
            <p className="helper" style={{ marginTop: 8 }}>
                Minimum 8 characters, include at least one letter and one number.
            </p>
        </form>
    );
}

function PasswordField(props: { label: string; name: string; autoComplete: string }) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label>{props.label}</label>
            <div style={{ position: "relative" }}>
                <input
                    name={props.name}
                    type={show ? "text" : "password"}
                    autoComplete={props.autoComplete}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="secondary"
                    style={{
                        position: "absolute",
                        right: 6,
                        top: "50%",
                        transform: "translateY(-50%)",
                        padding: "6px 10px",
                    }}
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );
}
