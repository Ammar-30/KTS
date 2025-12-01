/**
 * TADA repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { TadaStatus } from "@/lib/constants";
import { TadaFilters, PaginatedResponse } from "@/types/api.types";

export class TadaRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.tadaRequest.findUnique({
      where: { id },
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
  }

  async findMany(filters: TadaFilters): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      status,
      tripId,
    } = filters;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.TadaRequestWhereInput = {};
    if (status) where.status = status;
    if (tripId) where.tripId = tripId;

    const [data, total] = await Promise.all([
      this.prisma.tadaRequest.findMany({
        where,
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
        orderBy: { [sort]: order },
        skip,
        take,
      }),
      this.prisma.tadaRequest.count({ where }),
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

  async findByTripId(tripId: string) {
    return this.prisma.tadaRequest.findFirst({
      where: { tripId },
      include: {
        trip: {
          include: {
            requester: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.TadaRequestCreateInput) {
    return this.prisma.tadaRequest.create({
      data,
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
  }

  async update(id: string, data: Prisma.TadaRequestUpdateInput) {
    return this.prisma.tadaRequest.update({
      where: { id },
      data,
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
  }
}

