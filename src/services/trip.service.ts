/**
 * Trip service - business logic layer
 */

import { prisma } from "@/lib/db";
import {
  tripRepository,
  driverRepository,
  vehicleRepository,
  notificationRepository,
  userRepository,
} from "@/repositories";
import {
  TRIP_STATUS,
  isValidTransition,
  TRIP_STATUS_TRANSITIONS,
  TripStatus,
} from "@/lib/constants";
import {
  NotFoundError,
  ConflictError,
  StateTransitionError,
  ForbiddenError,
} from "@/lib/errors";
import { CreateTripInput, ApproveTripInput, AssignTripInput } from "@/validators/trip.validator";
import { createNotificationsForRole, createNotification } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import { SessionPayload } from "@/types/api.types";

export class TripService {
  async createTrip(input: CreateTripInput, requesterId: string) {
    // Get user department if not provided
    const user = await userRepository.findById(requesterId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const trip = await tripRepository.create({
      purpose: input.purpose,
      fromLoc: input.fromLoc,
      toLoc: input.toLoc,
      fromTime: input.fromTime,
      toTime: input.toTime,
      stops: input.stops || null,
      company: input.company,
      department: input.department || user.department || null,
      requester: { connect: { id: requesterId } },
      status: TRIP_STATUS.REQUESTED,
      vehicleCategory: input.vehicleCategory,
      personalVehicleDetails: input.personalVehicleDetails || null,
      entitledVehicle: input.entitledVehicleId
        ? { connect: { id: input.entitledVehicleId } }
        : undefined,
      passengerNames: input.passengerNames || null,
    });

    // Notify managers (non-blocking)
    try {
      await createNotificationsForRole({
        role: "MANAGER",
        type: "TRIP_REQUEST",
        title: "New Trip Request",
        message: `${user.name || "An employee"} has submitted a new trip request: ${input.purpose}`,
        link: `/manager`,
      });
    } catch (error) {
      logger.error({ error, tripId: trip.id }, "Failed to notify managers");
    }

    return trip;
  }

  async approveTrip(input: ApproveTripInput, session: SessionPayload) {
    const result = await prisma.$transaction(
      async (tx) => {
        const trip = await tx.trip.findUnique({
          where: { id: input.tripId },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            entitledVehicle: { select: { vehicleNumber: true } },
          },
        });

        if (!trip) {
          throw new NotFoundError("Trip");
        }

        // Prevent self-approval
        if (trip.requesterId === session.sub) {
          throw new ForbiddenError("Cannot approve your own trip");
        }

        // Validate current status
        if (trip.status !== TRIP_STATUS.REQUESTED) {
          throw new StateTransitionError(trip.status, input.decision === "approve" ? TRIP_STATUS.MANAGER_APPROVED : TRIP_STATUS.MANAGER_REJECTED);
        }

        // Determine new status
        let newStatus: TripStatus =
          input.decision === "reject"
            ? TRIP_STATUS.MANAGER_REJECTED
            : TRIP_STATUS.MANAGER_APPROVED;

        // Special: PERSONAL or ENTITLED vehicles skip Transport department
        const isSelfManaged =
          input.decision === "approve" &&
          (trip.vehicleCategory === "PERSONAL" || trip.vehicleCategory === "ENTITLED");

        if (isSelfManaged) {
          newStatus = TRIP_STATUS.TRANSPORT_ASSIGNED;
        }

        // Validate transition
        if (!isValidTransition(trip.status, newStatus, TRIP_STATUS_TRANSITIONS)) {
          throw new StateTransitionError(trip.status, newStatus);
        }

        // Prepare update data
        const updateData: any = {
          status: newStatus,
          approvedById: session.sub,
          rejectionReason: input.decision === "reject" ? (input.rejectionReason || null) : null,
        };

        // If self-managed, auto-assign
        if (isSelfManaged) {
          updateData.assignedById = session.sub;
          updateData.driverName = trip.requester.name; // Requester is the driver
          updateData.vehicleNumber =
            trip.vehicleCategory === "PERSONAL"
              ? trip.personalVehicleDetails || "Personal Vehicle"
              : trip.entitledVehicle?.vehicleNumber || "Entitled Vehicle";
        }

        // Update trip
        const updatedTrip = await tx.trip.update({
          where: { id: input.tripId },
          data: updateData,
          include: {
            requester: { select: { id: true, name: true, email: true } },
          },
        });

        // Notify requester (within transaction using tx client)
        try {
          const type = input.decision === "reject" ? "TRIP_REJECTED" : (isSelfManaged ? "VEHICLE_ASSIGNED" : "TRIP_APPROVED");
          const title = input.decision === "reject" ? "Trip Request Rejected" : (isSelfManaged ? "Trip Approved & Assigned" : "Trip Request Approved");
          const message = input.decision === "reject"
            ? `Your trip request "${trip.purpose}" has been rejected.${input.rejectionReason ? ` Reason: ${input.rejectionReason}` : ""}`
            : (isSelfManaged
              ? `Your trip request "${trip.purpose}" has been approved and auto-assigned (Personal/Entitled Vehicle).`
              : `Your trip request "${trip.purpose}" has been approved.`);

          await tx.notification.create({
            data: {
              userId: trip.requesterId,
              type,
              title,
              message,
              link: "/employee/trips",
            },
          });
        } catch (error) {
          logger.error({ error, tripId: trip.id }, "Failed to create notification");
        }

        return { updatedTrip, tripPurpose: trip.purpose, rejectionReason: input.rejectionReason };
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );

    return result.updatedTrip;
  }

  async assignTrip(input: AssignTripInput, session: SessionPayload) {
    // Use longer timeout for transaction (15 seconds) to handle multiple queries
    const result = await prisma.$transaction(
      async (tx) => {
        // Get trip
        const trip = await tx.trip.findUnique({
          where: { id: input.tripId },
          include: {
            requester: { select: { id: true, name: true, email: true } },
          },
        });

        if (!trip) {
          throw new NotFoundError("Trip");
        }

        // Validate status
        if (trip.status !== TRIP_STATUS.MANAGER_APPROVED) {
          throw new StateTransitionError(trip.status, TRIP_STATUS.TRANSPORT_ASSIGNED);
        }

        // Validate driver and vehicle in parallel for faster execution
        const [driver, vehicle] = await Promise.all([
          tx.driver.findFirst({
            where: { id: input.driverId, active: true },
            select: { id: true, name: true, phone: true },
          }),
          tx.vehicle.findFirst({
            where: { id: input.vehicleId, active: true },
            select: { id: true, number: true },
          }),
        ]);
        if (!driver) {
          throw new NotFoundError("Driver not found or inactive");
        }
        if (!vehicle) {
          throw new NotFoundError("Vehicle not found or inactive");
        }

        // Check driver and vehicle availability in parallel for faster execution
        const [driverBusy, vehicleBusy] = await Promise.all([
          tx.trip.findFirst({
            where: {
              driverId: input.driverId,
              status: { in: ["TransportAssigned", "InProgress"] },
              id: { not: input.tripId },
              fromTime: { lt: trip.toTime },
              toTime: { gt: trip.fromTime },
            },
            select: { id: true },
          }),
          tx.trip.findFirst({
            where: {
              vehicleId: input.vehicleId,
              status: { in: ["TransportAssigned", "InProgress"] },
              id: { not: input.tripId },
              fromTime: { lt: trip.toTime },
              toTime: { gt: trip.fromTime },
            },
            select: { id: true },
          }),
        ]);
        if (driverBusy) {
          throw new ConflictError("Selected driver is already occupied in this time slot");
        }
        if (vehicleBusy) {
          throw new ConflictError("Selected vehicle is already assigned in this time slot");
        }

        // Update trip (no select to reduce query time - we already have all data)
        await tx.trip.update({
          where: { id: input.tripId },
          data: {
            status: TRIP_STATUS.TRANSPORT_ASSIGNED,
            assignedById: session.sub,
            driverId: input.driverId,
            vehicleId: input.vehicleId,
            driverName: driver.name,
            vehicleNumber: vehicle.number,
            startMileage: input.startMileage,
          },
        });

        // Return data we already have - no need to query again
        return {
          trip: {
            id: input.tripId,
            purpose: trip.purpose,
            fromLoc: trip.fromLoc,
            toLoc: trip.toLoc,
            fromTime: trip.fromTime,
            toTime: trip.toTime,
            company: trip.company,
            department: trip.department,
            passengerNames: trip.passengerNames,
            vehicleCategory: trip.vehicleCategory,
            requester: trip.requester,
            driver: { id: driver.id, name: driver.name, phone: driver.phone },
            vehicle: { id: vehicle.id, number: vehicle.number },
          },
          driver,
          vehicle,
          tripRequester: trip.requester,
          tripPurpose: trip.purpose,
          vehicleCategory: trip.vehicleCategory,
        };
      },
      {
        maxWait: 20000, // Maximum time to wait for a transaction slot (20 seconds)
        timeout: 30000, // Maximum time the transaction can run (30 seconds)
      }
    );

    // Notify transport (non-blocking, outside transaction)
    if (result.vehicleCategory === "FLEET" || !result.vehicleCategory) {
      try {
        await createNotificationsForRole({
          role: "TRANSPORT",
          type: "VEHICLE_ASSIGNED",
          title: "Fleet Vehicle Assigned",
          message: `Vehicle ${result.vehicle.number} has been assigned to ${result.tripRequester?.name || "employee"} for trip: ${result.tripPurpose}. Driver: ${result.driver.name}`,
          link: "/transport",
        });
      } catch (error) {
        logger.error({ error, tripId: result.trip.id }, "Failed to notify transport");
      }
    }

    // Notify employee (requester) that their trip has been assigned (non-blocking)
    if (result.tripRequester) {
      try {
        await createNotification({
          userId: result.tripRequester.id,
          type: "VEHICLE_ASSIGNED",
          title: "Vehicle Assigned to Your Trip",
          message: `Your trip request "${result.tripPurpose}" has been assigned. Driver: ${result.driver.name}, Vehicle: ${result.vehicle.number}`,
          link: "/employee/trips",
        });
      } catch (error) {
        logger.error({ error, tripId: result.trip.id, userId: result.tripRequester.id }, "Failed to notify employee");
      }
    }

    return { trip: result.trip, driver: result.driver, vehicle: result.vehicle };
  }

  async cancelTrip(tripId: string, session: SessionPayload) {
    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip");
    }

    const isOwner = trip.requesterId === session.sub;
    const isPrivileged = ["ADMIN", "TRANSPORT", "MANAGER"].includes(session.role);

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenError();
    }

    // Block cancel if already assigned or beyond
    const blocked: TripStatus[] = [TRIP_STATUS.TRANSPORT_ASSIGNED, TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.COMPLETED];
    if (blocked.includes(trip.status as TripStatus)) {
      throw new ConflictError(`Cannot cancel when status is ${trip.status}`);
    }

    return await tripRepository.update(tripId, {
      status: TRIP_STATUS.CANCELLED,
    });
  }
}

export const tripService = new TripService();

