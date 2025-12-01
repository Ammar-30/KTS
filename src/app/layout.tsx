export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";
import { getSession } from "@lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
    title: "KIPS Transport",
    description: "Transport Management System",
    icons: {
        icon: "/Kips_Logo.png",
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    noStore();

    const session = await getSession();
    const user = session
        ? { name: session.name, email: session.email, role: session.role }
        : undefined;

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ToastProvider>
                    {user ? (
                        <DashboardLayout user={user}>
                            {children}
                        </DashboardLayout>
                    ) : (
                        <main className="shell" style={{ maxWidth: "100%", padding: 0 }}>
                            {children}
                        </main>
                    )}
                </ToastProvider>
            </body>
        </html>
    );
}
