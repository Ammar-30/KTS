import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding vehicle images...");

    const vehicles = await prisma.vehicle.findMany();
    console.log(`Found ${vehicles.length} vehicles.`);

    // Map of vehicle number patterns to image filenames
    const imageMap: Record<string, string> = {
        "LEA-1234": "corolla.png", // Assuming this is a Corolla
        "ENT-1111": "civic.png",   // Assuming this is a Civic
        "SUZ-9999": "cultus.png",  // Assuming this is a Cultus
    };

    // Fallback images if specific mapping not found
    const fallbackImages = ["corolla.png", "civic.png", "cultus.png"];

    for (const vehicle of vehicles) {
        let imageName = imageMap[vehicle.number];

        if (!imageName) {
            // Assign a random image if no specific mapping
            const randomIndex = Math.floor(Math.random() * fallbackImages.length);
            imageName = fallbackImages[randomIndex];
        }

        const imageUrl = `/uploads/${imageName}`;

        // Update vehicle with image
        await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: {
                images: JSON.stringify([imageUrl])
            }
        });

        console.log(`Updated vehicle ${vehicle.number} with image ${imageUrl}`);
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
