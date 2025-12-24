/**
 * Clear all trips, notifications, TADA requests, and maintenance requests
 * Keeps users, drivers, and vehicles for a fresh start
 */

import { prisma } from "../src/lib/db";

async function clear() {
  console.log("🗑️  Clearing database data...");

  try {
    // Delete in order to respect foreign key constraints
    console.log("  - Deleting notifications...");
    await prisma.notification.deleteMany({});
    console.log("    ✓ Notifications cleared");

    console.log("  - Deleting TADA requests...");
    await prisma.tadaRequest.deleteMany({});
    console.log("    ✓ TADA requests cleared");

    console.log("  - Deleting maintenance requests...");
    await prisma.maintenanceRequest.deleteMany({});
    console.log("    ✓ Maintenance requests cleared");

    console.log("  - Deleting trips...");
    await prisma.trip.deleteMany({});
    console.log("    ✓ Trips cleared");

    console.log("  - Deleting entitled vehicles...");
    await prisma.entitledVehicle.deleteMany({});
    console.log("    ✓ Entitled vehicles cleared");

    console.log("\n✅ Database cleared successfully!");
    console.log("   Users, drivers, and vehicles have been preserved.");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clear();





