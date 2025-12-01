export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getSession } from "@lib/auth";
import { prisma } from "@lib/db";
import ChangePasswordForm from "./ChangePasswordForm";

type SearchParams = { ok?: string; error?: string };

export default async function ProfilePage(props: { searchParams: Promise<SearchParams> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true, email: true }
    });

    const sp = (await props.searchParams) ?? {};
    const ok = sp.ok === "1";
    const error = sp.error;

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h1 className="welcome-text">Settings</h1>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>Manage your account settings and preferences.</p>
                </div>
            </div>

            {/* Settings Sections */}
            <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Update Email */}
                <details className="card" style={{ padding: 0 }}>
                    <summary style={{
                        padding: "20px 24px",
                        cursor: "pointer",
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        borderBottom: "1px solid var(--border-light)"
                    }}>
                        <div>
                            <div style={{ marginBottom: 4 }}>Update Email</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>
                                Change your account email address
                            </div>
                        </div>
                        <span style={{ fontSize: "20px", color: "var(--text-tertiary)" }}>▾</span>
                    </summary>

                    <div style={{ padding: "20px 24px" }}>
                        <form action="/api/profile/update-email" method="post">
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Current Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--border)",
                                        background: "var(--bg-body)",
                                        color: "var(--text-tertiary)"
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 13 }}>New Email *</label>
                                <input
                                    name="newEmail"
                                    type="email"
                                    required
                                    placeholder="new.email@example.com"
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 13 }}>Confirm Password *</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Enter your password to confirm"
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                                Update Email
                            </button>
                        </form>
                    </div>
                </details>

                {/* Change Password */}
                <details className="card" style={{ padding: 0 }}>
                    <summary style={{
                        padding: "20px 24px",
                        cursor: "pointer",
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        borderBottom: "1px solid var(--border-light)"
                    }}>
                        <div>
                            <div style={{ marginBottom: 4 }}>Change Password</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>
                                Update your account password
                            </div>
                        </div>
                        <span style={{ fontSize: "20px", color: "var(--text-tertiary)" }}>▾</span>
                    </summary>

                    <div style={{ padding: "20px 24px" }}>
                        {ok && (
                            <div style={{
                                marginBottom: 20,
                                padding: "12px 16px",
                                borderRadius: "8px",
                                background: "var(--success-bg)",
                                color: "var(--success-text)",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 14
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Password updated successfully.
                            </div>
                        )}

                        {error && (
                            <div style={{
                                marginBottom: 20,
                                padding: "12px 16px",
                                borderRadius: "8px",
                                background: "var(--danger-bg)",
                                color: "var(--danger-text)",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 14
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <ChangePasswordForm />
                    </div>
                </details>

                {/* Contact Us */}
                <details className="card" style={{ padding: 0 }}>
                    <summary style={{
                        padding: "20px 24px",
                        cursor: "pointer",
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        borderBottom: "1px solid var(--border-light)"
                    }}>
                        <div>
                            <div style={{ marginBottom: 4 }}>Contact Us</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>
                                Get in touch with our support team
                            </div>
                        </div>
                        <span style={{ fontSize: "20px", color: "var(--text-tertiary)" }}>▾</span>
                    </summary>

                    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                background: "var(--primary-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" style={{ width: 20, height: 20 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Email Support</div>
                                <a href="mailto:support@kipstransport.com" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 14 }}>
                                    support@kipstransport.com
                                </a>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                background: "var(--primary-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" style={{ width: 20, height: 20 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Phone Support</div>
                                <a href="tel:+92-300-1234567" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 14 }}>
                                    +92-300-1234567
                                </a>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                                background: "var(--primary-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" style={{ width: 20, height: 20 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Support Hours</div>
                                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                                    Monday - Friday: 9:00 AM - 6:00 PM
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
