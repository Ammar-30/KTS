import { format } from "date-fns";
import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names - useful for conditional className merging
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date and time: yyyy-MM-dd HH:mm
 */
export function fmtDateTime(d: string | Date) {
  try {
    return format(new Date(d), "yyyy-MM-dd HH:mm");
  } catch {
    return String(d);
  }
}

/**
 * Format date only: yyyy-MM-dd
 */
export function fmtDate(d: string | Date) {
  try {
    return format(new Date(d), "yyyy-MM-dd");
  } catch {
    return String(d);
  }
}

/**
 * Format time only: HH:mm
 */
export function fmtTime(d: string | Date) {
  try {
    return format(new Date(d), "HH:mm");
  } catch {
    return String(d);
  }
}
