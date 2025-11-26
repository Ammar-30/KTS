export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getSession } from "@lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

type SearchParams = { ok?: string; error?: string };

export default async function ProfilePage(props: { searchParams: Promise<SearchParams> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const sp = (await props.searchParams) ?? {};
    const ok = sp.ok === "1";
    const error = sp.error;

    return (
        <div className="shell">
            <div style={{ maxWidth: 520, margin: "40px auto" }}>
                <div className="flex-between mb-4">
                    <h1>Profile Settings</h1>
                </div>

                {/* Change Password Card */}
                <div className="card">
                    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-light)" }}>
                        <h2>Change Password</h2>
                        <p className="text-muted" style={{ fontSize: 14 }}>
                            Update your password associated with <strong>{(session as any).email}</strong>
                        </p>
                    </div>

                    {ok && (
                        <div className="banner success" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Password updated successfully.
                        </div>
                    )}

                    {error && (
                        <div className="banner error" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: 18, height: 18 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
}
