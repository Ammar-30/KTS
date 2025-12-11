import { prisma } from "./db";
import { logger } from "./logger";

export type NotificationType =
    | "TRIP_REQUEST"
    | "TRIP_APPROVED"
    | "TRIP_REJECTED"
    | "TADA_REQUEST"
    | "TADA_APPROVED"
    | "TADA_REJECTED"
    | "MAINTENANCE_REQUEST"
    | "MAINTENANCE_APPROVED"
    | "MAINTENANCE_REJECTED"
    | "MAINTENANCE_COMPLETED"
    | "MAINTENANCE_ISSUE_REPORTED"
    | "VEHICLE_REQUEST"
    | "VEHICLE_ASSIGNED";

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link || null,
            },
        });
        logger.debug({ userId: params.userId, type: params.type }, "Notification created");
    } catch (error) {
        logger.error({ error, params }, "Failed to create notification");
        // Don't throw - notifications are non-critical
    }
}

/**
 * Create notifications for all users with a specific role
 * Uses batch insert for better performance
 */
export async function createNotificationsForRole(params: {
    role: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        const users = await prisma.user.findMany({
            where: { role: params.role },
            select: { id: true },
        });

        if (users.length === 0) {
            logger.warn({ role: params.role }, "No users found with role");
            return;
        }

        // Use batch insert for better performance (SQLite compatible)
        const notifications = users.map((user) => ({
            userId: user.id,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
        }));

        // SQLite doesn't support createMany, so we use Promise.all with individual creates
        // But we do it in parallel batches to avoid overwhelming the DB
        const batchSize = 10;
        for (let i = 0; i < notifications.length; i += batchSize) {
            const batch = notifications.slice(i, i + batchSize);
            await Promise.all(
                batch.map((notification) =>
                    prisma.notification.create({ data: notification })
                )
            );
        }

        logger.debug(
            { role: params.role, userCount: users.length },
            "Successfully created notifications for role"
        );
    } catch (error) {
        logger.error({ error, params }, "Failed to create notifications for role");
        // Don't throw - notifications are non-critical
    }
}

