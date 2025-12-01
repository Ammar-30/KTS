"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isToday, getDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface DateTimePickerProps {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    min?: string;
    required?: boolean;
    placeholder?: string;
    label?: string;
}

export default function DateTimePicker({ 
    name, 
    value, 
    onChange, 
    min, 
    required, 
    placeholder = "Select date and time",
    label 
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
    const [time, setTime] = useState(() => {
        if (value) {
            const d = new Date(value);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return "09:00";
    });
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync with value prop
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setSelectedDate(d);
            setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        }
    }, [value]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
    };

    const handleConfirm = () => {
        if (selectedDate) {
            const [hours, minutes] = time.split(':');
            const dateTime = new Date(selectedDate);
            dateTime.setHours(parseInt(hours), parseInt(minutes));
            
            // Format as ISO string for datetime-local input
            const year = dateTime.getFullYear();
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const day = String(dateTime.getDate()).padStart(2, '0');
            const hour = String(dateTime.getHours()).padStart(2, '0');
            const minute = String(dateTime.getMinutes()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}T${hour}:${minute}`;
            
            onChange?.(formatted);
            setIsOpen(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Get calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const displayValue = selectedDate 
        ? `${format(selectedDate, "dd/MM/yyyy")}, ${time}`
        : placeholder;

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div 
            ref={wrapperRef} 
            style={{ 
                position: "relative", 
                width: "100%",
            }}
        >
            <input
                type="text"
                readOnly
                onClick={() => setIsOpen(!isOpen)}
                value={displayValue}
                className="has-icon"
                style={{
                    cursor: "pointer",
                    color: selectedDate ? "var(--text-main)" : "var(--text-tertiary)",
                }}
                required={required}
            />
            
            {/* Hidden input for form submission */}
            <input 
                type="hidden"
                name={name}
                value={selectedDate && time ? (() => {
                    const [hours, minutes] = time.split(':');
                    const dateTime = new Date(selectedDate);
                    dateTime.setHours(parseInt(hours), parseInt(minutes));
                    const year = dateTime.getFullYear();
                    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
                    const day = String(dateTime.getDate()).padStart(2, '0');
                    const hour = String(dateTime.getHours()).padStart(2, '0');
                    const minute = String(dateTime.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day}T${hour}:${minute}`;
                })() : ""}
                required={required}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            marginTop: "8px",
                            background: "white",
                            borderRadius: "var(--radius-lg)",
                            boxShadow: "var(--shadow-xl)",
                            border: "1px solid var(--border-light)",
                            zIndex: 1000,
                            minWidth: "320px",
                            padding: "24px",
                        }}
                    >
                        {/* Calendar Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <button
                                type="button"
                                onClick={prevMonth}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderRadius: "var(--radius-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-body)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            
                            <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)" }}>
                                {format(currentMonth, "MMMM yyyy")}
                            </div>
                            
                            <button
                                type="button"
                                onClick={nextMonth}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderRadius: "var(--radius-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-body)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Week Days */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "12px" }}>
                            {weekDays.map((day) => (
                                <div 
                                    key={day}
                                    style={{
                                        textAlign: "center",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "var(--text-tertiary)",
                                        padding: "8px 4px",
                                    }}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "20px" }}>
                            {days.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isTodayDate = isToday(day);
                                
                                // Check min date constraint
                                const minDate = min ? new Date(min) : null;
                                const isDisabled = minDate && day < minDate && !isSameDay(day, minDate);
                                
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => !isDisabled && handleDateSelect(day)}
                                        disabled={isDisabled || !isCurrentMonth}
                                        style={{
                                            aspectRatio: "1",
                                            border: "none",
                                            background: isSelected 
                                                ? "var(--primary-gradient)" 
                                                : isTodayDate 
                                                    ? "var(--primary-light)" 
                                                    : "transparent",
                                            color: isSelected 
                                                ? "white" 
                                                : !isCurrentMonth 
                                                    ? "var(--text-tertiary)" 
                                                    : isTodayDate 
                                                        ? "var(--primary)" 
                                                        : "var(--text-main)",
                                            borderRadius: "var(--radius-sm)",
                                            fontSize: "14px",
                                            fontWeight: isSelected || isTodayDate ? 600 : 400,
                                            cursor: isDisabled || !isCurrentMonth ? "not-allowed" : "pointer",
                                            opacity: isDisabled || !isCurrentMonth ? 0.4 : 1,
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isDisabled && isCurrentMonth && !isSelected) {
                                                e.currentTarget.style.background = "var(--bg-body)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isDisabled && isCurrentMonth && !isSelected) {
                                                e.currentTarget.style.background = isTodayDate ? "var(--primary-light)" : "transparent";
                                            }
                                        }}
                                    >
                                        {format(day, "d")}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time Selector */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ 
                                display: "block", 
                                fontSize: "13px", 
                                fontWeight: 600, 
                                color: "var(--text-main)", 
                                marginBottom: "8px" 
                            }}>
                                Time
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "15px",
                                    background: "var(--input-bg)",
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: "10px 20px",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    background: "transparent",
                                    color: "var(--text-main)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--bg-body)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!selectedDate}
                                style={{
                                    padding: "10px 20px",
                                    border: "none",
                                    borderRadius: "var(--radius-md)",
                                    background: selectedDate ? "var(--primary-gradient)" : "var(--border)",
                                    color: selectedDate ? "white" : "var(--text-tertiary)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: selectedDate ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                    boxShadow: selectedDate ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedDate) {
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(79, 70, 229, 0.4)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedDate) {
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

