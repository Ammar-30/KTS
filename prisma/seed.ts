import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Hash password for all users (you can change this)
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create Users
    console.log("Creating users...");

    const admin = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@kips.pk",
            passwordHash,
            role: "ADMIN",
            department: "Administration",
        },
    });

    const manager = await prisma.user.create({
        data: {
            name: "Manager Ahmed",
            email: "manager@kips.pk",
            passwordHash,
            role: "MANAGER",
            department: "Management",
        },
    });

    const transport = await prisma.user.create({
        data: {
            name: "Transport Officer",
            email: "transport@kips.pk",
            passwordHash,
            role: "TRANSPORT",
            department: "Transport",
        },
    });

    const employee1 = await prisma.user.create({
        data: {
            name: "Ali Hassan",
            email: "ali.hassan@kips.pk",
            passwordHash,
            role: "EMPLOYEE",
            department: "Marketing",
        },
    });

    const employee2 = await prisma.user.create({
        data: {
            name: "Sara Khan",
            email: "sara.khan@kips.pk",
            passwordHash,
            role: "EMPLOYEE",
            department: "Sales",
        },
    });

    const employee3 = await prisma.user.create({
        data: {
            name: "Bilal Ahmed",
            email: "bilal.ahmed@kips.pk",
            passwordHash,
            role: "EMPLOYEE",
            department: "HR",
        },
    });

    console.log("✅ Created 6 users (1 admin, 1 manager, 1 transport, 3 employees)");

    // Create Drivers
    console.log("Creating drivers...");

    await prisma.driver.createMany({
        data: [
            { name: "Muhammad Aslam", phone: "0300-1234567", licenseNo: "LHR-12345", active: true },
            { name: "Akbar Ali", phone: "0321-9876543", licenseNo: "LHR-67890", active: true },
            { name: "Rashid Mahmood", phone: "0333-5555555", licenseNo: "ISB-11223", active: true },
            { name: "Tariq Aziz", phone: "0345-4444444", licenseNo: "KHI-99887", active: true },
            { name: "Naveed Iqbal", phone: "0312-7777777", licenseNo: "LHR-55566", active: true },
        ],
    });

    console.log("✅ Created 5 drivers with phone numbers");

    // Create Vehicles
    console.log("Creating vehicles...");

    await prisma.vehicle.createMany({
        data: [
            { number: "LEA-1234", type: "Sedan", capacity: 4, active: true },
            { number: "LEA-5678", type: "SUV", capacity: 7, active: true },
            { number: "LEB-9012", type: "Van", capacity: 12, active: true },
            { number: "LEC-3456", type: "Sedan", capacity: 4, active: true },
            { number: "LED-7890", type: "Mini Bus", capacity: 15, active: true },
        ],
    });

    console.log("✅ Created 5 vehicles");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Login Credentials (all users):");
    console.log("   Password: password123");
    console.log("\n👥 User Accounts:");
    console.log("   Admin:     admin@kips.pk");
    console.log("   Manager:   manager@kips.pk");
    console.log("   Transport: transport@kips.pk");
    console.log("   Employee:  ali.hassan@kips.pk");
    console.log("   Employee:  sara.khan@kips.pk");
    console.log("   Employee:  bilal.ahmed@kips.pk");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
