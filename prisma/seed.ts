import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Clear existing data (delete in order to respect foreign key constraints)
    await prisma.tadaRequest.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.entitledVehicle.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.user.deleteMany();

    // Hash password for all users
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create Users
    console.log("Creating users...");

    const admin = await prisma.user.create({
        data: { name: "Admin User", email: "admin@kips.pk", passwordHash, role: "ADMIN", department: "Administration" },
    });

    const manager = await prisma.user.create({
        data: { name: "Manager Ahmed", email: "manager@kips.pk", passwordHash, role: "MANAGER", department: "Management" },
    });

    const transport = await prisma.user.create({
        data: { name: "Transport Officer", email: "transport@kips.pk", passwordHash, role: "TRANSPORT", department: "Transport" },
    });

    const employee1 = await prisma.user.create({
        data: { name: "Ali Hassan", email: "ali.hassan@kips.pk", passwordHash, role: "EMPLOYEE", department: "Marketing" },
    });

    const employee2 = await prisma.user.create({
        data: { name: "Sara Khan", email: "sara.khan@kips.pk", passwordHash, role: "EMPLOYEE", department: "Sales" },
    });

    const employee3 = await prisma.user.create({
        data: { name: "Bilal Ahmed", email: "bilal.ahmed@kips.pk", passwordHash, role: "EMPLOYEE", department: "HR" },
    });

    console.log("✅ Created users");

    // Create Drivers
    console.log("Creating drivers...");
    const drivers = await Promise.all([
        prisma.driver.create({ data: { name: "Muhammad Aslam", phone: "0300-1234567", licenseNo: "LHR-12345", active: true } }),
        prisma.driver.create({ data: { name: "Akbar Ali", phone: "0321-9876543", licenseNo: "LHR-67890", active: true } }),
        prisma.driver.create({ data: { name: "Rashid Mahmood", phone: "0333-5555555", licenseNo: "ISB-11223", active: true } }),
    ]);
    console.log("✅ Created drivers");

    // Create Fleet Vehicles
    console.log("Creating fleet vehicles...");
    const vehicles = await Promise.all([
        prisma.vehicle.create({ data: { number: "LEA-1234", type: "Sedan", capacity: 4, active: true } }),
        prisma.vehicle.create({ data: { number: "LEA-5678", type: "SUV", capacity: 7, active: true } }),
        prisma.vehicle.create({ data: { number: "LEB-9012", type: "Van", capacity: 12, active: true } }),
    ]);
    console.log("✅ Created fleet vehicles");

    // Create Entitled Vehicles
    console.log("Creating entitled vehicles...");
    const entitledVehicle1 = await prisma.entitledVehicle.create({
        data: {
            vehicleNumber: "ENT-1111",
            vehicleType: "Civic",
            userId: employee1.id,
            active: true
        }
    });
    console.log("✅ Created entitled vehicles");

    // Create Trips
    console.log("Creating trips...");
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now); dayAfter.setDate(dayAfter.getDate() + 2);

    // 1. Fleet Trip (Requested)
    await prisma.trip.create({
        data: {
            purpose: "Client Visit",
            fromLoc: "KIPS Head Office",
            toLoc: "Gulberg Branch",
            fromTime: tomorrow,
            toTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
            company: "KIPS_PREPS",
            department: "Marketing",
            requesterId: employee1.id,
            status: "Requested",
            vehicleCategory: "FLEET"
        }
    });

    // 2. Fleet Trip (Manager Approved)
    await prisma.trip.create({
        data: {
            purpose: "Site Inspection",
            fromLoc: "KIPS Head Office",
            toLoc: "Johar Town Branch",
            fromTime: dayAfter,
            toTime: new Date(dayAfter.getTime() + 3 * 60 * 60 * 1000),
            company: "TETB",
            department: "Sales",
            requesterId: employee2.id,
            status: "ManagerApproved",
            approvedById: manager.id,
            vehicleCategory: "FLEET"
        }
    });

    // 3. Personal Vehicle Trip (Approved)
    await prisma.trip.create({
        data: {
            purpose: "Urgent Meeting",
            fromLoc: "Home",
            toLoc: "KIPS Head Office",
            fromTime: tomorrow,
            toTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
            company: "KDP",
            department: "HR",
            requesterId: employee3.id,
            status: "Approved",
            approvedById: manager.id,
            vehicleCategory: "PERSONAL",
            personalVehicleDetails: "Honda City LEA-9999"
        }
    });

    // 4. Entitled Vehicle Trip (Approved)
    await prisma.trip.create({
        data: {
            purpose: "Daily Commute",
            fromLoc: "Home",
            toLoc: "Office",
            fromTime: tomorrow,
            toTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000),
            company: "KIPS_PREPS",
            department: "Marketing",
            requesterId: employee1.id,
            status: "Approved",
            approvedById: manager.id,
            vehicleCategory: "ENTITLED",
            entitledVehicleId: entitledVehicle1.id
        }
    });

    console.log("✅ Created trips");

    // Create Maintenance Requests (cost will be entered by transport team)
    console.log("Creating maintenance requests...");
    await prisma.maintenanceRequest.create({
        data: {
            description: "Engine oil change and filter replacement",
            status: "COMPLETED",
            cost: 5200,
            requesterId: employee1.id,
            entitledVehicleId: entitledVehicle1.id,
            completedAt: new Date(),
            updatedAt: new Date()
        }
    });

    await prisma.maintenanceRequest.create({
        data: {
            description: "Tire rotation and alignment check",
            status: "IN_PROGRESS",
            requesterId: employee1.id,
            entitledVehicleId: entitledVehicle1.id,
            updatedAt: new Date()
        }
    });

    await prisma.maintenanceRequest.create({
        data: {
            description: "Air conditioning repair",
            status: "APPROVED",
            requesterId: employee1.id,
            entitledVehicleId: entitledVehicle1.id,
            updatedAt: new Date()
        }
    });

    await prisma.maintenanceRequest.create({
        data: {
            description: "Brake pad replacement",
            status: "REQUESTED",
            requesterId: employee1.id,
            entitledVehicleId: entitledVehicle1.id,
            updatedAt: new Date()
        }
    });

    console.log("✅ Created maintenance requests");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Login Credentials (all users):");
    console.log("   Password: password123");
    console.log("   Admin:     admin@kips.pk");
    console.log("   Manager:   manager@kips.pk");
    console.log("   Transport: transport@kips.pk");
    console.log("   Employees: ali.hassan@kips.pk, sara.khan@kips.pk, bilal.ahmed@kips.pk");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
