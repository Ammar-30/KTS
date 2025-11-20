import pkg from "@prisma/client";
import bcrypt from "bcrypt";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("Pass@1234", 10);

    // Users
    const users = [
        { email: "ammar@kips.pk",     name: "Ammar",          role: "EMPLOYEE"  },
        { email: "salman@kips.pk",    name: "Salman",         role: "MANAGER"   },
        { email: "transport@kips.pk", name: "Transport Dept", role: "TRANSPORT" }
    ];
    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { ...u, passwordHash }
        });
    }

    // Drivers (idempotent)
    const drivers = [
        { id: "seed-ali",    name: "Ali",    phone: "0300-1111111", licenseNo: "DL-ALI-001" },
        { id: "seed-hassan", name: "Hassan", phone: "0301-2222222", licenseNo: "DL-HSN-002" },
        { id: "seed-usman",  name: "Usman",  phone: "0302-3333333", licenseNo: "DL-USM-003" }
    ];
    for (const d of drivers) {
        await prisma.driver.upsert({
            where: { id: d.id },
            update: { active: true },
            create: { ...d, active: true }
        });
    }

    // Vehicles (idempotent)
    const vehicles = [
        { number: "LEA-1234", type: "Car",   capacity: 4  },
        { number: "LEB-5678", type: "Van",   capacity: 8  },
        { number: "LEC-9012", type: "Hiace", capacity: 14 }
    ];
    for (const v of vehicles) {
        await prisma.vehicle.upsert({
            where: { number: v.number },
            update: { active: true },
            create: { ...v, active: true }
        });
    }

    console.log("Seed complete: Users + Drivers + Vehicles.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
