import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
    connectionString
});

const prisma = new PrismaClient({
    adapter
});

const main = async () => {

    const password = "Password@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        {
            name: "Admin User",
            email: "admin@erp.com",
            role: UserRole.ADMIN
        },
        {
            name: "Sales User",
            email: "sales@erp.com",
            role: UserRole.SALES
        },
        {
            name: "Warehouse User",
            email: "warehouse@erp.com",
            role: UserRole.WAREHOUSE
        },
        {
            name: "Accounts User",
            email: "accounts@erp.com",
            role: UserRole.ACCOUNTS
        }
    ];

    for (const user of users) {

        await prisma.user.upsert({
            where: {
                email: user.email
            },

            update: {},

            create: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role
            }
        });
    }

    console.log("Users seeded successfully");
};

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });