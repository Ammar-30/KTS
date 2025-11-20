"use client";

import { useEffect, useState } from "react";

/**
 * Toggles between LIGHT (default) and DARK (adds `body.dark-mode`).
 * Persists in localStorage as "theme": "light" | "dark".
 */
export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // On mount: read persisted pref, apply class
    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
        const preferDark = saved === "dark";
        setIsDark(preferDark);
        if (preferDark) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <button
            onClick={toggle}
            className="button secondary"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{ padding: "6px 10px" }}
        >
            {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
    );
}
