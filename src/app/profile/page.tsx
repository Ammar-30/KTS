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
        <div>
            {/* Change Password Card */}
            <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
                <h2>Change Password</h2>
                <p className="helper" style={{ marginTop: 4 }}>
                    Signed in as <strong>{(session as any).email}</strong>
                </p>

                {ok && <div className="banner success" style={banner(true)}>Password updated successfully.</div>}
                {error && <div className="banner error" style={banner(false)}>{error}</div>}

                <ChangePasswordForm />
            </div>
        </div>
    );
}

function banner(ok: boolean) {
    return {
        margin: "12px 0",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${ok ? "rgba(16,185,129,.45)" : "rgba(239,68,68,.45)"}`,
        background: ok ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
        color: ok ? "#065f46" : "#7f1d1d",
    } as const;
}
