/**
 * Application-wide constants
 * Centralizes all magic strings and enums
 */

export const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  TRANSPORT: "TRANSPORT",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TRIP_STATUS = {
  REQUESTED: "Requested",
  MANAGER_APPROVED: "ManagerApproved",
  MANAGER_REJECTED: "ManagerRejected",
  TRANSPORT_ASSIGNED: "TransportAssigned",
  IN_PROGRESS: "InProgress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

export const TADA_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type TadaStatus = (typeof TADA_STATUS)[keyof typeof TADA_STATUS];

export const MAINTENANCE_STATUS = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUS)[keyof typeof MAINTENANCE_STATUS];

export const VEHICLE_CATEGORY = {
  FLEET: "FLEET",
  PERSONAL: "PERSONAL",
  ENTITLED: "ENTITLED",
} as const;

export type VehicleCategory = (typeof VEHICLE_CATEGORY)[keyof typeof VEHICLE_CATEGORY];

export const COMPANIES = {
  KIPS_PREPS: "KIPS_PREPS",
  TETB: "TETB",
  QUALITY_BRANDS: "QUALITY_BRANDS",
  KDP: "KDP",
} as const;

export type Company = (typeof COMPANIES)[keyof typeof COMPANIES];

/**
 * Valid state transitions for trips
 */
export const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TRIP_STATUS.REQUESTED]: [
    TRIP_STATUS.MANAGER_APPROVED,
    TRIP_STATUS.MANAGER_REJECTED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.MANAGER_APPROVED]: [
    TRIP_STATUS.TRANSPORT_ASSIGNED,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.MANAGER_REJECTED]: [TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.TRANSPORT_ASSIGNED]: [
    TRIP_STATUS.IN_PROGRESS,
    TRIP_STATUS.CANCELLED,
  ],
  [TRIP_STATUS.IN_PROGRESS]: [TRIP_STATUS.COMPLETED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.COMPLETED]: [], // Terminal state
  [TRIP_STATUS.CANCELLED]: [], // Terminal state
};

/**
 * Valid state transitions for TADA requests
 */
export const TADA_STATUS_TRANSITIONS: Record<TadaStatus, TadaStatus[]> = {
  [TADA_STATUS.PENDING]: [TADA_STATUS.APPROVED, TADA_STATUS.REJECTED],
  [TADA_STATUS.APPROVED]: [], // Terminal state
  [TADA_STATUS.REJECTED]: [], // Terminal state
};

/**
 * Valid state transitions for maintenance requests
 */
export const MAINTENANCE_STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MAINTENANCE_STATUS.REQUESTED]: [
    MAINTENANCE_STATUS.APPROVED,
    MAINTENANCE_STATUS.REJECTED,
  ],
  [MAINTENANCE_STATUS.APPROVED]: [
    MAINTENANCE_STATUS.IN_PROGRESS,
    MAINTENANCE_STATUS.REJECTED,
  ],
  [MAINTENANCE_STATUS.REJECTED]: [], // Terminal state
  [MAINTENANCE_STATUS.IN_PROGRESS]: [MAINTENANCE_STATUS.COMPLETED],
  [MAINTENANCE_STATUS.COMPLETED]: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition<T extends string>(
  current: T,
  next: T,
  transitions: Record<T, T[]>
): boolean {
  return transitions[current]?.includes(next) ?? false;
}




