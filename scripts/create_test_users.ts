
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const users = [
        { email: "employee@kips.com", name: "Test Employee", role: "EMPLOYEE" },
        { email: "manager@kips.com", name: "Test Manager", role: "MANAGER" },
        { email: "transport@kips.com", name: "Test Transport", role: "TRANSPORT" },
    ];

    for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
            console.log(`User ${u.email} already exists. Updating role...`);
            await prisma.user.update({
                where: { email: u.email },
                data: { role: u.role },
            });
        } else {
            console.log(`Creating user ${u.email}...`);
            const hashedPassword = await bcrypt.hash("password123", 10);
            await prisma.user.create({
                data: {
                    email: u.email,
                    name: u.name,
                    passwordHash: hashedPassword,
                    role: u.role,
                },
            });
        }
    }

    console.log("Test users created/updated successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
