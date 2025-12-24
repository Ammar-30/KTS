/**
 * Maintenance repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { MaintenanceStatus } from "@/lib/constants";
import { MaintenanceFilters, PaginatedResponse } from "@/types/api.types";

export class MaintenanceRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.maintenanceRequest.findUnique({
      where: { id },
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
  }

  async findMany(filters: MaintenanceFilters): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      status,
      entitledVehicleId,
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.MaintenanceRequestWhereInput = {};
    if (status) where.status = status;
    if (entitledVehicleId) where.entitledVehicleId = entitledVehicleId;

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
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
        orderBy: { [sort]: order },
        skip,
        take,
      }),
      this.prisma.maintenanceRequest.count({ where }),
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

  async create(data: Prisma.MaintenanceRequestCreateInput) {
    return this.prisma.maintenanceRequest.create({
      data,
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
  }

  async update(id: string, data: Prisma.MaintenanceRequestUpdateInput) {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data,
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
  }
}





