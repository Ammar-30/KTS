"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface DropdownProps {
    isOpen: boolean;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const dropdownVariants = {
    closed: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
        },
    },
    open: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 30,
        },
    },
};

export default function AnimatedDropdown({
    isOpen,
    children,
    className,
    style,
}: DropdownProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={dropdownVariants}
                    className={className}
                    style={style}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

