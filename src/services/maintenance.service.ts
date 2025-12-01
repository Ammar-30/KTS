/**
 * Maintenance service - business logic layer
 */

import { prisma } from "@/lib/db";
import { maintenanceRepository } from "@/repositories";
import {
  MAINTENANCE_STATUS,
  isValidTransition,
  MAINTENANCE_STATUS_TRANSITIONS,
} from "@/lib/constants";
import { NotFoundError, StateTransitionError, ForbiddenError } from "@/lib/errors";
import {
  CreateMaintenanceInput,
  CreateFleetMaintenanceInput,
  ApproveMaintenanceInput,
  CompleteMaintenanceInput,
} from "@/validators/maintenance.validator";
import { createNotificationsForRole, createNotification } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { SessionPayload } from "@/types/api.types";

export class MaintenanceService {
  async createMaintenance(input: CreateMaintenanceInput, requesterId: string) {
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify vehicle belongs to user
        const vehicle = await tx.entitledVehicle.findUnique({
          where: { id: input.entitledVehicleId },
        });

        if (!vehicle || vehicle.userId !== requesterId) {
          throw new NotFoundError("Vehicle not found or access denied");
        }

        const request = await tx.maintenanceRequest.create({
          data: {
            entitledVehicleId: input.entitledVehicleId,
            requesterId,
            description: input.description,
            status: MAINTENANCE_STATUS.REQUESTED,
          },
          include: {
            entitledVehicle: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return { request, vehicleNumber: vehicle.vehicleNumber };
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );

    // Notify managers and transport (outside transaction)
    try {
      await Promise.all([
        createNotificationsForRole({
          role: "MANAGER",
          type: "MAINTENANCE_REQUEST",
          title: "New Maintenance Request",
          message: `A new maintenance request has been submitted for vehicle ${result.vehicleNumber}`,
          link: "/manager/maintenance",
        }),
        createNotificationsForRole({
          role: "TRANSPORT",
          type: "MAINTENANCE_REQUEST",
          title: "New Vehicle Maintenance Request",
          message: `A new maintenance request has been submitted for vehicle ${result.vehicleNumber}. Awaiting manager approval.`,
          link: "/transport/maintenance",
        }),
      ]);
    } catch (error) {
      logger.error({ error, requestId: result.request.id }, "Failed to send notifications");
    }

    return result.request;
  }

  async createFleetMaintenance(input: CreateFleetMaintenanceInput, requesterId: string) {
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify vehicle exists and is active
        const vehicle = await tx.vehicle.findUnique({
          where: { id: input.vehicleId },
        });

        if (!vehicle || !vehicle.active) {
          throw new NotFoundError("Vehicle not found or inactive");
        }

        const request = await tx.maintenanceRequest.create({
          data: {
            vehicleId: input.vehicleId,
            requesterId,
            description: input.description,
            status: MAINTENANCE_STATUS.REQUESTED,
          },
          include: {
            vehicle: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return { request, vehicleNumber: vehicle.number };
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );

    // Notify managers (outside transaction)
    try {
      await createNotificationsForRole({
        role: "MANAGER",
        type: "MAINTENANCE_REQUEST",
        title: "New Fleet Vehicle Maintenance Request",
        message: `Transport department has submitted a maintenance request for fleet vehicle ${result.vehicleNumber}`,
        link: "/manager/maintenance",
      });
    } catch (error) {
      logger.error({ error, requestId: result.request.id }, "Failed to send notifications");
    }

    return result.request;
  }

  async approveMaintenance(input: ApproveMaintenanceInput, session: SessionPayload) {
    const result = await prisma.$transaction(
      async (tx) => {
        const request = await tx.maintenanceRequest.findUnique({
          where: { id: input.requestId },
          include: {
            entitledVehicle: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            vehicle: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (!request) {
          throw new NotFoundError("Maintenance request");
        }

        if (request.status !== MAINTENANCE_STATUS.REQUESTED) {
          throw new StateTransitionError(
            request.status,
            input.decision === "approve" ? MAINTENANCE_STATUS.APPROVED : MAINTENANCE_STATUS.REJECTED
          );
        }

        const newStatus =
          input.decision === "approve" ? MAINTENANCE_STATUS.APPROVED : MAINTENANCE_STATUS.REJECTED;

        if (!isValidTransition(request.status, newStatus, MAINTENANCE_STATUS_TRANSITIONS)) {
          throw new StateTransitionError(request.status, newStatus);
        }

        const vehicleNumber = request.entitledVehicle?.vehicleNumber || request.vehicle?.number || "Unknown";
        const isFleetVehicle = !!request.vehicleId;

        const updatedRequest = await tx.maintenanceRequest.update({
          where: { id: input.requestId },
          data: {
            status: newStatus,
            approvedById: session.sub,
            rejectionReason: input.decision === "reject" ? (input.rejectionReason || null) : null,
          },
          include: {
            entitledVehicle: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            vehicle: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Notify requester (within transaction using tx client)
        try {
          await tx.notification.create({
            data: {
              userId: request.requesterId,
              type: input.decision === "approve" ? "MAINTENANCE_APPROVED" : "MAINTENANCE_REJECTED",
              title: input.decision === "approve" ? "Maintenance Request Approved" : "Maintenance Request Rejected",
              message: input.decision === "approve"
                ? `Your maintenance request for vehicle ${vehicleNumber} has been approved${isFleetVehicle ? "" : " and sent to transport"}.`
                : `Your maintenance request for vehicle ${vehicleNumber} has been rejected.${input.rejectionReason ? ` Reason: ${input.rejectionReason}` : ""}`,
              link: isFleetVehicle ? "/transport/maintenance" : "/employee/maintenance",
            },
          });
        } catch (error) {
          logger.error({ error, requestId: request.id }, "Failed to create notification");
        }

        return {
          updatedRequest,
          vehicleNumber,
          decision: input.decision,
          rejectionReason: input.rejectionReason,
          isFleetVehicle,
        };
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );

    // Notify transport if approved and not a fleet vehicle request (fleet vehicles don't need transport approval)
    if (result.decision === "approve" && !result.isFleetVehicle) {
      try {
        await createNotificationsForRole({
          role: "TRANSPORT",
          type: "MAINTENANCE_REQUEST",
          title: "Vehicle Maintenance Request Approved",
          message: `A maintenance request has been approved for vehicle ${result.vehicleNumber}. Ready for work.`,
          link: "/transport/maintenance",
        });
      } catch (error) {
        logger.error({ error, requestId: result.updatedRequest.id }, "Failed to notify transport");
      }
    }

    return result.updatedRequest;
  }

  async startMaintenance(requestId: string, session: SessionPayload) {
    return await prisma.$transaction(
      async (tx) => {
        const request = await tx.maintenanceRequest.findUnique({
          where: { id: requestId },
        });

        if (!request) {
          throw new NotFoundError("Maintenance request");
        }

        if (request.status !== MAINTENANCE_STATUS.APPROVED) {
          throw new StateTransitionError(request.status, MAINTENANCE_STATUS.IN_PROGRESS);
        }

        if (!isValidTransition(request.status, MAINTENANCE_STATUS.IN_PROGRESS, MAINTENANCE_STATUS_TRANSITIONS)) {
          throw new StateTransitionError(request.status, MAINTENANCE_STATUS.IN_PROGRESS);
        }

        return await tx.maintenanceRequest.update({
          where: { id: requestId },
          data: { status: MAINTENANCE_STATUS.IN_PROGRESS },
          include: {
            entitledVehicle: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            vehicle: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );
  }

  async completeMaintenance(input: CompleteMaintenanceInput, session: SessionPayload) {
    return await prisma.$transaction(
      async (tx) => {
        const request = await tx.maintenanceRequest.findUnique({
          where: { id: input.requestId },
        });

        if (!request) {
          throw new NotFoundError("Maintenance request");
        }

        // Only transport/admin can complete (not employee)
        if (!["TRANSPORT", "ADMIN"].includes(session.role)) {
          throw new ForbiddenError("Only transport staff can complete maintenance");
        }

        if (request.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
          throw new StateTransitionError(request.status, MAINTENANCE_STATUS.COMPLETED);
        }

        if (!isValidTransition(request.status, MAINTENANCE_STATUS.COMPLETED, MAINTENANCE_STATUS_TRANSITIONS)) {
          throw new StateTransitionError(request.status, MAINTENANCE_STATUS.COMPLETED);
        }

        const updatedRequest = await tx.maintenanceRequest.update({
          where: { id: input.requestId },
          data: {
            status: MAINTENANCE_STATUS.COMPLETED,
            completedAt: new Date(),
            cost: input.cost || null,
          },
          include: {
            entitledVehicle: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            vehicle: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        const vehicleNumber = updatedRequest.entitledVehicle?.vehicleNumber || updatedRequest.vehicle?.number || "Unknown";
        const isFleetVehicle = !!updatedRequest.vehicleId;

        // Notify requester (within transaction using tx client)
        try {
          await tx.notification.create({
            data: {
              userId: request.requesterId,
              type: "MAINTENANCE_COMPLETED",
              title: "Maintenance Completed",
              message: `Maintenance for vehicle ${vehicleNumber} has been completed.${input.cost ? ` Cost: PKR ${input.cost}` : ""}`,
              link: isFleetVehicle ? "/transport/maintenance" : "/employee/maintenance",
            },
          });
        } catch (error) {
          logger.error({ error, requestId: request.id }, "Failed to create notification");
        }

        return updatedRequest;
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );
  }
}

export const maintenanceService = new MaintenanceService();

