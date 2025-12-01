-- CreateTable
CREATE TABLE "EntitledVehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleType" TEXT,
    "userId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "EntitledVehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purpose" TEXT NOT NULL,
    "fromLoc" TEXT NOT NULL,
    "toLoc" TEXT NOT NULL,
    "fromTime" DATETIME NOT NULL,
    "toTime" DATETIME NOT NULL,
    "stops" TEXT,
    "company" TEXT NOT NULL,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Requested',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "requesterId" TEXT NOT NULL,
    "approvedById" TEXT,
    "assignedById" TEXT,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "driverName" TEXT,
    "vehicleNumber" TEXT,
    "rejectionReason" TEXT,
    "startMileage" INTEGER,
    "endMileage" INTEGER,
    "vehicleCategory" TEXT NOT NULL DEFAULT 'FLEET',
    "personalVehicleDetails" TEXT,
    "entitledVehicleId" TEXT,
    CONSTRAINT "Trip_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_entitledVehicleId_fkey" FOREIGN KEY ("entitledVehicleId") REFERENCES "EntitledVehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("approvedById", "assignedById", "company", "createdAt", "department", "driverId", "driverName", "fromLoc", "fromTime", "id", "purpose", "rejectionReason", "requesterId", "status", "stops", "toLoc", "toTime", "updatedAt", "vehicleId", "vehicleNumber") SELECT "approvedById", "assignedById", "company", "createdAt", "department", "driverId", "driverName", "fromLoc", "fromTime", "id", "purpose", "rejectionReason", "requesterId", "status", "stops", "toLoc", "toTime", "updatedAt", "vehicleId", "vehicleNumber" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
