/**
 * Trip repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { TripStatus } from "@/lib/constants";
import { TripFilters, PaginatedResponse } from "@/types/api.types";

export class TripRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.trip.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        driver: true,
        vehicle: true,
        entitledVehicle: true,
        tadaRequests: true,
      },
    });
  }

  async findMany(filters: TripFilters): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      status,
      company,
      requesterId,
      fromDate,
      toDate,
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 per page

    const where: Prisma.TripWhereInput = {};
    if (status) where.status = status;
    if (company) where.company = company;
    if (requesterId) where.requesterId = requesterId;
    if (fromDate || toDate) {
      where.fromTime = {};
      if (fromDate) where.fromTime.gte = new Date(fromDate);
      if (toDate) where.fromTime.lte = new Date(toDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
          driver: true,
          vehicle: true,
        },
        orderBy: { [sort]: order },
        skip,
        take,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findByStatus(status: TripStatus) {
    return this.prisma.trip.findMany({
      where: { status },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByRequester(requesterId: string, filters?: TripFilters) {
    return this.findMany({
      ...filters,
      requesterId,
    });
  }

  async create(data: Prisma.TripCreateInput) {
    return this.prisma.trip.create({
      data,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TripUpdateInput) {
    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: true,
        vehicle: true,
      },
    });
  }

  async checkDriverAvailability(
    driverId: string,
    fromTime: Date,
    toTime: Date,
    excludeTripId?: string
  ) {
    const where: Prisma.TripWhereInput = {
      driverId,
      status: { in: ["TransportAssigned", "InProgress"] },
      AND: [
        { fromTime: { lt: toTime } },
        { toTime: { gt: fromTime } },
      ],
    };

    if (excludeTripId) {
      where.id = { not: excludeTripId };
    }

    return this.prisma.trip.findFirst({
      where,
      select: { id: true },
    });
  }

  async checkVehicleAvailability(
    vehicleId: string,
    fromTime: Date,
    toTime: Date,
    excludeTripId?: string
  ) {
    const where: Prisma.TripWhereInput = {
      vehicleId,
      status: { in: ["TransportAssigned", "InProgress"] },
      AND: [
        { fromTime: { lt: toTime } },
        { toTime: { gt: fromTime } },
      ],
    };

    if (excludeTripId) {
      where.id = { not: excludeTripId };
    }

    return this.prisma.trip.findFirst({
      where,
      select: { id: true },
    });
  }
}





