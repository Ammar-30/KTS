
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting verification...");

    // 1. Create an admin user to simulate the creator
    const admin = await prisma.user.create({
        data: {
            name: "Admin Tester",
            email: `admin-${Date.now()}@example.com`,
            passwordHash: "dummy",
            role: "ADMIN",
        },
    });

    console.log(`Created Admin: ${admin.email}`);

    // 2. Simulate API logic for creating a new employee
    const newEmployeeData = {
        name: "New Employee",
        email: `newemp-${Date.now()}@example.com`,
        password: "password123",
        role: "EMPLOYEE",
        department: "Engineering",
    };

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: newEmployeeData.email } });
    if (existing) {
        console.error("Email already exists (unexpected)");
        process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(newEmployeeData.password, 10);

    // Create user
    const newEmployee = await prisma.user.create({
        data: {
            name: newEmployeeData.name,
            email: newEmployeeData.email,
            passwordHash,
            role: newEmployeeData.role,
            department: newEmployeeData.department,
        },
    });

    console.log(`Created New Employee: ${newEmployee.email} (ID: ${newEmployee.id})`);

    // 3. Verify the employee exists in DB
    const verified = await prisma.user.findUnique({ where: { id: newEmployee.id } });
    if (!verified) {
        console.error("Failed to verify new employee in DB");
        process.exit(1);
    }

    if (verified.role !== "EMPLOYEE" || verified.department !== "Engineering") {
        console.error("Employee data mismatch");
        process.exit(1);
    }

    console.log("SUCCESS: Employee creation verified.");

    // Cleanup
    await prisma.user.delete({ where: { id: admin.id } });
    await prisma.user.delete({ where: { id: newEmployee.id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
