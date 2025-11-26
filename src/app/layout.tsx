export const dynamic = "force-dynamic";
export const revalidate = 0;

import "./globals.css";
import Topbar from "@/components/Topbar";
import { getSession } from "@lib/auth";
import { unstable_noStore as noStore } from "next/cache";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    noStore();

    const session = await getSession();
    const user = session
        ? { name: (session as any).name, email: (session as any).email, role: (session as any).role }
        : undefined;

    return (
        <html lang="en">
            <body>
                {/* Global header with logo (always visible) */}
                <header
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 100,
                        background: "var(--panel)",
                        padding: "12px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        /* don't rely on border-bottom; we draw our own line below */
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img
                            src="/Kips_Logo.png"
                            alt="KIPS Transport"
                            style={{ height: 75, objectFit: "contain" }}
                        />
                    </div>

                    {user && <Topbar user={user} />}

                    {/* Guaranteed hairline divider */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 1,
                            background:
                                "var(--divider, rgba(0,0,0,0.1))", // fallback for light
                            pointerEvents: "none",
                        }}
                    />
                </header>

                <main className="shell">{children}</main>
            </body>
        </html>
    );
}
