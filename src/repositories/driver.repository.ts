/**
 * Driver repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";

export class DriverRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.driver.findUnique({
      where: { id },
    });
  }

  async findByIdAndActive(id: string) {
    return this.prisma.driver.findFirst({
      where: { id, active: true },
    });
  }

  async findMany(active?: boolean) {
    const where: Prisma.DriverWhereInput = {};
    if (active !== undefined) {
      where.active = active;
    }
    return this.prisma.driver.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async create(data: Prisma.DriverCreateInput) {
    return this.prisma.driver.create({ data });
  }

  async update(id: string, data: Prisma.DriverUpdateInput) {
    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.driver.delete({
      where: { id },
    });
  }
}





