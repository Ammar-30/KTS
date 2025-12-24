/**
 * Repository exports
 */

import { prisma } from "@/lib/db";
import { TripRepository } from "./trip.repository";
import { TadaRepository } from "./tada.repository";
import { MaintenanceRepository } from "./maintenance.repository";
import { UserRepository } from "./user.repository";
import { DriverRepository } from "./driver.repository";
import { VehicleRepository } from "./vehicle.repository";
import { NotificationRepository } from "./notification.repository";

// Singleton instances
export const tripRepository = new TripRepository(prisma);
export const tadaRepository = new TadaRepository(prisma);
export const maintenanceRepository = new MaintenanceRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const driverRepository = new DriverRepository(prisma);
export const vehicleRepository = new VehicleRepository(prisma);
export const notificationRepository = new NotificationRepository(prisma);





