import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma_v2?: PrismaClient };

// Configure Prisma for better performance with SQLite
export const prisma =
    globalForPrisma.prisma_v2 ??
    new PrismaClient({
        log: ["warn", "error"],
        // Optimize for SQLite performance
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v2 = prisma;
