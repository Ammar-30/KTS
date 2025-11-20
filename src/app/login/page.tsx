"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
                credentials: "include",  // ⬅️ ensures cookies are saved
                cache: "no-store",        // ⬅️ prevents caching
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
                            : "/profile";

            // ⬅️ Force server to re-read cookies and render Topbar immediately
            router.replace(target);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card" style={{ maxWidth: 420, margin: "5rem auto" }}>
            <h1>Sign in</h1>
            <form onSubmit={onSubmit}>
                <label>Email</label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                />
                <label>Password</label>
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                />
                <div style={{ height: 8 }} />
                <button disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>
                {error && (
                    <p className="helper" style={{ color: "#fca5a5" }}>
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}
