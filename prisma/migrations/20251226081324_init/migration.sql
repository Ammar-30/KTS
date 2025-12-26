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
    "issueReported" BOOLEAN NOT NULL DEFAULT false,
    "issueDescription" TEXT,
    "issueReportedAt" DATETIME,
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
CREATE INDEX "MaintenanceRequest_issueReported_idx" ON "MaintenanceRequest"("issueReported");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
