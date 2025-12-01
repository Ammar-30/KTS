/**
 * Role-Based Access Control middleware
 */

import { NextRequest } from "next/server";
import { Role, ROLES } from "@/lib/constants";
import { ForbiddenError } from "@/lib/errors";
import { AuthenticatedRequest } from "./auth";

/**
 * Require one of the specified roles
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest) => {
    const session = req.session;
    if (!session || !allowedRoles.includes(session.role)) {
      throw new ForbiddenError(
        `This action requires one of the following roles: ${allowedRoles.join(", ")}`
      );
    }
    return req;
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Require manager or admin
 */
export const requireManager = requireRole(ROLES.MANAGER, ROLES.ADMIN);

/**
 * Require transport or admin
 */
export const requireTransport = requireRole(ROLES.TRANSPORT, ROLES.ADMIN);

/**
 * Require employee or admin
 */
export const requireEmployee = requireRole(ROLES.EMPLOYEE, ROLES.ADMIN);

/**
 * Require manager, transport, or admin
 */
export const requireManagerOrTransport = requireRole(
  ROLES.MANAGER,
  ROLES.TRANSPORT,
  ROLES.ADMIN
);




