/**
 * TADA service - business logic layer
 */

import { prisma } from "@/lib/db";
import { tadaRepository, tripRepository } from "@/repositories";
import { TADA_STATUS, isValidTransition, TADA_STATUS_TRANSITIONS } from "@/lib/constants";
import { NotFoundError, ConflictError, StateTransitionError } from "@/lib/errors";
import { CreateTadaInput, ApproveTadaInput } from "@/validators/tada.validator";
import { createNotificationsForRole, createNotification } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { SessionPayload } from "@/types/api.types";

export class TadaService {
  async createTada(input: CreateTadaInput, requesterId: string) {
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify trip belongs to user
        const trip = await tx.trip.findUnique({
          where: { id: input.tripId },
          include: { tadaRequests: true },
        });

        if (!trip || trip.requesterId !== requesterId) {
          throw new NotFoundError("Trip not found or access denied");
        }

        // Validate trip status
        const allowedStatuses = ["ManagerApproved", "TransportAssigned", "InProgress", "Completed"];
        if (!allowedStatuses.includes(trip.status)) {
          throw new ConflictError("Trip must be approved or completed to claim allowance");
        }

        // Check if TADA already exists
        if (trip.tadaRequests.length > 0) {
          throw new ConflictError("Claim already exists for this trip");
        }

        // Create TADA request
        const tadaRequest = await tx.tadaRequest.create({
          data: {
            tripId: input.tripId,
            amount: input.amount,
            description: input.description,
            status: TADA_STATUS.PENDING,
          },
          include: {
            trip: {
              include: {
                requester: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        return { tadaRequest, tripPurpose: trip.purpose || "Trip", amount: input.amount };
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
        type: "TADA_REQUEST",
        title: "New Allowance Request",
        message: `A new allowance claim of PKR ${result.amount} has been submitted for trip: ${result.tripPurpose}`,
        link: "/manager/allowances",
      });
    } catch (error) {
      logger.error({ error, tadaId: result.tadaRequest.id }, "Failed to notify managers");
    }

    return result.tadaRequest;
  }

  async approveTada(input: ApproveTadaInput, session: SessionPayload) {
    const result = await prisma.$transaction(
      async (tx) => {
        const request = await tx.tadaRequest.findUnique({
          where: { id: input.requestId },
          include: {
            trip: {
              include: {
                requester: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        if (!request) {
          throw new NotFoundError("TADA request");
        }

        if (request.status !== TADA_STATUS.PENDING) {
          throw new StateTransitionError(request.status, input.decision === "approve" ? TADA_STATUS.APPROVED : TADA_STATUS.REJECTED);
        }

        const newStatus = input.decision === "approve" ? TADA_STATUS.APPROVED : TADA_STATUS.REJECTED;

        if (!isValidTransition(request.status, newStatus, TADA_STATUS_TRANSITIONS)) {
          throw new StateTransitionError(request.status, newStatus);
        }

        const updatedRequest = await tx.tadaRequest.update({
          where: { id: input.requestId },
          data: {
            status: newStatus,
            rejectionReason: input.decision === "reject" ? (input.rejectionReason || null) : null,
          },
          include: {
            trip: {
              include: {
                requester: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        // Notify employee (within transaction using tx client)
        try {
          await tx.notification.create({
            data: {
              userId: request.trip.requesterId,
              type: input.decision === "approve" ? "TADA_APPROVED" : "TADA_REJECTED",
              title: input.decision === "approve" ? "Allowance Claim Approved" : "Allowance Claim Rejected",
              message: input.decision === "approve"
                ? `Your allowance claim of PKR ${request.amount} has been approved.`
                : `Your allowance claim of PKR ${request.amount} has been rejected.${input.rejectionReason ? ` Reason: ${input.rejectionReason}` : ""}`,
              link: "/employee/allowances",
            },
          });
        } catch (error) {
          logger.error({ error, tadaId: request.id }, "Failed to create notification");
        }

        return updatedRequest;
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );

    return result;
  }
}

export const tadaService = new TadaService();

