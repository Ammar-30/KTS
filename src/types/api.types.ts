/**
 * API request/response types
 */

import { Role, TripStatus, TadaStatus, MaintenanceStatus } from "@/lib/constants";

export interface SessionPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    field?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TripFilters extends PaginationParams {
  status?: TripStatus;
  company?: string;
  requesterId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface TadaFilters extends PaginationParams {
  status?: TadaStatus;
  tripId?: string;
}

export interface MaintenanceFilters extends PaginationParams {
  status?: MaintenanceStatus;
  entitledVehicleId?: string;
}




