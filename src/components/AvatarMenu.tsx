"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AvatarMenu({ initial, label }: { initial: string; label: string }) {
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    // Close on outside click / Escape
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("click", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("click", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div ref={boxRef} className="avatar-box">
            <button
                type="button"
                className="avatar-btn"
                aria-label={`Profile menu for ${label}`}
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
                title={label}
            >
                {initial}
            </button>

            {open && (
                <div className="menu-dropdown" role="menu">
                    <div className="menu-header" title={label}>
                        <div className="avatar-mini">{initial}</div>
                        <div className="menu-user">
                            <div className="menu-name">{label}</div>
                        </div>
                    </div>

                    <div className="menu-sep" />

                    <Link href="/profile" className="menu-item" role="menuitem">
                        Change Password
                    </Link>

                    <form action="/api/auth/logout" method="post">
                        <button className="menu-item danger" type="submit" role="menuitem">
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
