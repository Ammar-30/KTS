/**
 * Vehicle repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";

export class VehicleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async findByIdAndActive(id: string) {
    return this.prisma.vehicle.findFirst({
      where: { id, active: true },
    });
  }

  async findByNumber(number: string) {
    return this.prisma.vehicle.findUnique({
      where: { number },
    });
  }

  async findMany(active?: boolean) {
    const where: Prisma.VehicleWhereInput = {};
    if (active !== undefined) {
      where.active = active;
    }
    return this.prisma.vehicle.findMany({
      where,
      orderBy: { number: "asc" },
    });
  }

  async create(data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.create({ data });
  }

  async update(id: string, data: Prisma.VehicleUpdateInput) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}




