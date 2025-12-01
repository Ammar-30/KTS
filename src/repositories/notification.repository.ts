/**
 * Notification repository - data access layer
 */

import { PrismaClient, Prisma } from "@prisma/client";

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async findManyByUser(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  async createMany(data: Prisma.NotificationCreateManyInput[]) {
    // SQLite doesn't support createMany, so we use Promise.all
    return Promise.all(
      data.map((item) => this.prisma.notification.create({ data: item }))
    );
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}




