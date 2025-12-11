"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
                cache: "no-store",
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || "Login failed");
            }

            const { role } = await res.json();
            const target =
                role === "EMPLOYEE"
                    ? "/employee"
                    : role === "MANAGER"
                        ? "/manager"
                        : role === "TRANSPORT"
                            ? "/transport"
                            : "/admin";

            router.replace(target);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo Section */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 24
                    }}>
                        <Image
                            src="/Kips_Logo.png"
                            alt="KIPS Logo"
                            width={80}
                            height={80}
                            priority
                            style={{
                                objectFit: "contain",
                                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))"
                            }}
                        />
                    </div>
                    <h1 style={{
                        fontSize: 32,
                        marginBottom: 8,
                        fontWeight: 700,
                        background: "var(--primary-gradient)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        KIPS Transport
                    </h1>
                    <p className="text-muted" style={{ fontSize: 15 }}>
                        Sign in to access your dashboard
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                required
                                placeholder="name@kips.edu.pk"
                                className="has-icon"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                required
                                placeholder="••••••••"
                                className="has-icon"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            width: "100%",
                            padding: "12px 16px",
                            marginBottom: 24,
                            borderRadius: "12px",
                            background: "var(--danger-bg)",
                            border: "1px solid var(--danger-border)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 20, height: 20, color: "var(--danger-text)", flexShrink: 0 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span style={{ color: "var(--danger-text)", fontSize: 14, fontWeight: 500 }}>
                                {error}
                            </span>
                        </div>
                    )}

                    <button
                        className="button primary"
                        style={{
                            width: "100%",
                            height: "52px",
                            fontSize: "16px",
                            fontWeight: 600,
                            marginTop: 8
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: 20, height: 20, marginRight: 8 }}>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18, marginLeft: 8 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: 32,
                    paddingTop: 24,
                    borderTop: "1px solid var(--border-light)",
                    textAlign: "center"
                }}>
                    <p style={{
                        fontSize: 13,
                        color: "var(--text-tertiary)",
                        margin: 0
                    }}>
                        © {new Date().getFullYear()} KIPS Education System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
