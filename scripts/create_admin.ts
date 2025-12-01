import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Creating admin user...");

    const email = "admin@kips.com";
    const password = "password123";
    const name = "Admin User";

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`User with email ${email} already exists.`);
        // Optional: Update role if needed, but for now just exit or log
        if (existingUser.role !== "ADMIN") {
            console.log("Updating role to ADMIN...");
            await prisma.user.update({
                where: { email },
                data: { role: "ADMIN" },
            });
            console.log("Role updated.");
        }
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: "ADMIN",
        },
    });

    console.log(`Admin user created: ${user.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
