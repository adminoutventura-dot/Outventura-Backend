import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedRoles(): Promise<void> {
    console.log('🌱 Role seeding ...');

    const roles = [
        { code: 'SUPER', description: 'Super administrador del sistema' },
        { code: 'ADMIN', description: 'Administrador del sistema' },
        { code: 'USER', description: 'Usuari estàndard logged in' },
        { code: 'GUEST', description: 'Usuari convidat' },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { code: role.code },
            update: {},
            create: role,
        });
    }

    console.log('... end seeding Role.\n');
}

async function seedUsers(): Promise<void> {
    console.log('🌱 User seeding ...');

    const superRole = await prisma.role.findUnique({
        where: { code: 'SUPER' },
    });

    const adminRole = await prisma.role.findUnique({
        where: { code: 'ADMIN' },
    });

    const userRole = await prisma.role.findUnique({
        where: { code: 'USER' },
    });

    if (!superRole || !adminRole || !userRole) {
        throw new Error('These roles are missing from the database. Please run seedRoles first.');
    }

    const hashedSuper = await bcrypt.hash('superadmin', 10);
    const hashedAdmin = await bcrypt.hash('admin', 10);
    const hashedUser = await bcrypt.hash('user', 10);

    const users = [
        { name: 'Carolina', surname: 'Agullo', email: 'carolina@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Miriam', surname: 'Navalon', email: 'miriam@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Paco', surname: 'Perez', email: 'paco@admin.com', phone: '123456789', password: hashedAdmin, roleId: adminRole.id_role },
        { name: 'Lola', surname: 'Lopez', email: 'lola@user.com', phone: '123456789', password: hashedUser, roleId: userRole.id_role },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    console.log('... end seeding User.\n');
}


async function main() {
    try {
        await seedRoles();
        await seedUsers();


        console.log('Seeding succesfully completed.');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });