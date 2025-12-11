/*
  Warnings:

  - A unique constraint covering the columns `[vehicleNumber]` on the table `EntitledVehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaintenanceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "rejectionReason" TEXT,
    "cost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "entitledVehicleId" TEXT,
    "vehicleId" TEXT,
    "requesterId" TEXT NOT NULL,
    "approvedById" TEXT,
    CONSTRAINT "MaintenanceRequest_entitledVehicleId_fkey" FOREIGN KEY ("entitledVehicleId") REFERENCES "EntitledVehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MaintenanceRequest" ("approvedById", "completedAt", "cost", "createdAt", "description", "entitledVehicleId", "id", "rejectionReason", "requesterId", "status", "updatedAt", "vehicleId") SELECT "approvedById", "completedAt", "cost", "createdAt", "description", "entitledVehicleId", "id", "rejectionReason", "requesterId", "status", "updatedAt", "vehicleId" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");
CREATE INDEX "MaintenanceRequest_requesterId_idx" ON "MaintenanceRequest"("requesterId");
CREATE INDEX "MaintenanceRequest_entitledVehicleId_idx" ON "MaintenanceRequest"("entitledVehicleId");
CREATE INDEX "MaintenanceRequest_vehicleId_idx" ON "MaintenanceRequest"("vehicleId");
CREATE INDEX "MaintenanceRequest_createdAt_idx" ON "MaintenanceRequest"("createdAt");
CREATE TABLE "new_TadaRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "claimType" TEXT NOT NULL DEFAULT 'Other',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tripId" TEXT NOT NULL,
    CONSTRAINT "TadaRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TadaRequest" ("amount", "createdAt", "description", "id", "rejectionReason", "status", "tripId", "updatedAt") SELECT "amount", "createdAt", "description", "id", "rejectionReason", "status", "tripId", "updatedAt" FROM "TadaRequest";
DROP TABLE "TadaRequest";
ALTER TABLE "new_TadaRequest" RENAME TO "TadaRequest";
CREATE INDEX "TadaRequest_status_idx" ON "TadaRequest"("status");
CREATE INDEX "TadaRequest_createdAt_idx" ON "TadaRequest"("createdAt");
CREATE INDEX "TadaRequest_tripId_idx" ON "TadaRequest"("tripId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Driver_active_idx" ON "Driver"("active");

-- CreateIndex
CREATE UNIQUE INDEX "EntitledVehicle_vehicleNumber_key" ON "EntitledVehicle"("vehicleNumber");

-- CreateIndex
CREATE INDEX "EntitledVehicle_userId_idx" ON "EntitledVehicle"("userId");

-- CreateIndex
CREATE INDEX "EntitledVehicle_active_idx" ON "EntitledVehicle"("active");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "Trip_requesterId_idx" ON "Trip"("requesterId");

-- CreateIndex
CREATE INDEX "Trip_createdAt_idx" ON "Trip"("createdAt");

-- CreateIndex
CREATE INDEX "Trip_driverId_status_idx" ON "Trip"("driverId", "status");

-- CreateIndex
CREATE INDEX "Trip_vehicleId_status_idx" ON "Trip"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "Trip_fromTime_toTime_idx" ON "Trip"("fromTime", "toTime");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Vehicle_active_idx" ON "Vehicle"("active");
