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
        { code: 'GUIDE', description: 'Guia de les activitats' },
        { code: 'USER', description: 'Usuari estàndard logged in' },
        { code: 'GUEST', description: 'Usuari convidat' },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { code: role.code },
            update: {},
            create: role
        });
    }

    console.log('... end seeding Role.\n');
}

async function seedUsers(): Promise<void> {
    console.log('🌱 User seeding ...');

    const superRole = await prisma.role.findUnique({ where: { code: 'SUPER' } });
    const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
    const guideRole = await prisma.role.findUnique({ where: { code: 'GUIDE' } });
    const userRole = await prisma.role.findUnique({ where: { code: 'USER' } });

    if (!superRole || !adminRole || !guideRole || !userRole) {
        throw new Error('Roles missing. Run seedRoles first.');
    }

    const hashedSuper = await bcrypt.hash('superadmin', 10);
    const hashedAdmin = await bcrypt.hash('adminadmin', 10);
    const hashedGuide = await bcrypt.hash('guideguide', 10);
    const hashedUser = await bcrypt.hash('useruser', 10);

    const users = [
        { name: 'Carolina', surname: 'Agullo', email: 'carolina@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Miriam', surname: 'Navalon', email: 'miriam@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Paco', surname: 'Perez', email: 'paco@admin.com', phone: '123456789', password: hashedAdmin, roleId: adminRole.id_role },
        { name: 'Carlos', surname: 'Cruz', email: 'carlos@guide.com', phone: '123456789', password: hashedGuide, roleId: guideRole.id_role },
        { name: 'Lola', surname: 'Lopez', email: 'lola@user.com', phone: '123456789', password: hashedUser, roleId: userRole.id_role },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user
        });
    }

    console.log('... end seeding User.\n');
}

async function seedBookingStatuses(): Promise<void> {
    console.log('🌱 BookingStatus seeding ...');

    const statuses = [
        { code: 'PENDING', description: 'Reserva pendent de confirmació' },
        { code: 'ACCEPTED', description: 'Reserva acceptada' },
        { code: 'IN_PROGRESS', description: 'Reserva en curs' },
        { code: 'FINISHED', description: 'Reserva finalitzada' },
        { code: 'CANCELLED', description: 'Reserva cancel·lada' },
    ];

    for (const status of statuses) {
        await prisma.bookingStatus.upsert({
            where: { code: status.code },
            update: {},
            create: status
        });
    }

    console.log('... end seeding BookingStatus.\n');
}

async function seedEquipmentStatuses(): Promise<void> {
    console.log('🌱 EquipmentStatus seeding ...');

    const statuses = [
        { code: 'AVAILABLE', description: 'El material està disponible per a ser llogat' },
        { code: 'UNAVAILABLE', description: 'El material no està disponible temporalment' },
        { code: 'DISCONTINUED', description: 'El material ja no està disponible per a lloguer' },
    ];

    for (const status of statuses) {
        await prisma.equipmentStatus.upsert({
            where: { code: status.code },
            update: {},
            create: status
        });
    }

    console.log('... end seeding EquipmentStatus.\n');
}

async function seedGuides(): Promise<void> {
    console.log('🌱 Guide seeding ...');

    const carlosUser = await prisma.user.findUnique({ where: { email: 'carlos@guide.com' } });

    if (!carlosUser) {
        throw new Error('Guide user not found. Run seedUsers first.');
    }

    await prisma.guide.upsert({
        where: { userId: carlosUser.id_user },
        update: {},
        create: { userId: carlosUser.id_user, specialty: 'Senderisme', credentials: 'Llicència federativa núm. 1234' }
    });
    console.log('... end seeding Guide.\n');
}

async function seedCategories(): Promise<void> {
    console.log('🌱 Category seeding ...');

    const categories = [
        { code: 'AQUATIC', description: 'Activitats aquàtiques' },
        { code: 'SNOW', description: 'Activitats de neu' },
        { code: 'HIKING', description: 'Senderisme i rutes' },
        { code: 'MOUNTAIN', description: 'Activitats de muntanya' },
        { code: 'CAMPING', description: 'Acampada i bivac' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { code: category.code },
            update: {},
            create: category
        });
    }

    console.log('... end seeding Category.\n');
}

async function seedActivities(): Promise<void> {
    console.log('🌱 Activity seeding ...');

    const guide = await prisma.guide.findFirst();

    if (!guide) {
        throw new Error('No guides found. Run seedGuides first.');
    }

    const hikingCategory = await prisma.category.findUnique({ where: { code: 'HIKING' } });

    const activity = await prisma.activity.upsert({
        where: { id_activity: 1 },
        update: {},
        create: {
            title: 'Ruta de les Fonts',
            description: 'Ruta guiada per les fonts naturals del riu.',
            init_date: new Date('2026-06-15T09:00:00Z'),
            end_date: new Date('2026-06-15T14:00:00Z'),
            difficulty: 2,
            max_participants: 15,
            start_end_point: 'Plaça de l\'Ajuntament',
            guideId: guide.id_guide,
        }
    });

    if (hikingCategory) {
        await prisma.activity.update({
            where: { id_activity: activity.id_activity },
            data: { categories: { connect: { id_category: hikingCategory.id_category } } }
        });
    }

    console.log('... end seeding Activity.\n');
}

async function seedEquipment(): Promise<void> {
    console.log('🌱 Equipment seeding ...');

    const availableStatus = await prisma.equipmentStatus.findUnique({ where: { code: 'AVAILABLE' } });

    if (!availableStatus) {
        throw new Error('AVAILABLE status not found. Run seedEquipmentStatuses first.');
    }

    const hikingCategory = await prisma.category.findUnique({ where: { code: 'HIKING' } });

    const equipment = [
        {
            title: 'Trekking poles',
            description: 'Lightweight aluminium trekking poles, adjustable height',
            price_per_day: 5.00,
            units: 10,
            statusId: availableStatus.id_status
        },
        {
            title: 'Hiking backpack 45L',
            description: 'Waterproof backpack with ergonomic back system',
            price_per_day: 8.00,
            units: 5,
            statusId: availableStatus.id_status
        },
        {
            title: 'Camping tent 2 people',
            description: '3-season tent, easy assembly, 2kg',
            price_per_day: 15.00,
            units: 3,
            statusId: availableStatus.id_status
        },
    ];

    for (const item of equipment) {
        const created = await prisma.equipment.create({ data: item });

        if (hikingCategory) {
            await prisma.equipment.update({
                where: { id_equipment: created.id_equipment },
                data: { categories: { connect: { id_category: hikingCategory.id_category } } }
            });
        }
    }

    console.log('... end seeding Equipment.\n');
}

async function main() {
    try {
        await seedRoles();
        await seedUsers();
        await seedBookingStatuses();
        await seedEquipmentStatuses();
        await seedGuides();
        await seedCategories();
        await seedActivities();
        await seedEquipment();

        console.log('Seeding successfully completed.');
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