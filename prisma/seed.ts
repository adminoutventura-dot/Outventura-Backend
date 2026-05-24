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
        { code: 'USER', description: 'Usuari estàndard registrat' },
        { code: 'GUEST', description: 'Usuari convidat' },
    ];
    for (const role of roles) {
        await prisma.role.upsert({ where: { code: role.code }, update: {}, create: role });
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
        throw new Error('Falten rols. Executa seedRoles primer.');
    }

    const hashedSuper = await bcrypt.hash('superadmin', 10);
    const hashedAdmin = await bcrypt.hash('adminadmin', 10);
    const hashedGuide = await bcrypt.hash('guideguide', 10);
    const hashedUser = await bcrypt.hash('useruser', 10);

    const users = [
        { name: 'Carolina', surname: 'Crespo', email: 'carolina@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Miriam', surname: 'Molina', email: 'miriam@superadmin.com', phone: '123456789', password: hashedSuper, roleId: superRole.id_role },
        { name: 'Paco', surname: 'Perez', email: 'paco@admin.com', phone: '123456789', password: hashedAdmin, roleId: adminRole.id_role },
        { name: 'Carlos', surname: 'Cruz', email: 'carlos@guide.com', phone: '123456789', password: hashedGuide, roleId: guideRole.id_role },
        { name: 'Sandra', surname: 'Soler', email: 'sandra@guide.com', phone: '123456789', password: hashedGuide, roleId: guideRole.id_role },
        { name: 'Lola', surname: 'Lopez', email: 'lola@user.com', phone: '123456789', password: hashedUser, roleId: userRole.id_role },
        { name: 'Marc', surname: 'Mas', email: 'marc@user.com', phone: '123456789', password: hashedUser, roleId: userRole.id_role },
    ];

    for (const user of users) {
        await prisma.user.upsert({ where: { email: user.email }, update: {}, create: user });
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
        await prisma.bookingStatus.upsert({ where: { code: status.code }, update: {}, create: status });
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
        await prisma.equipmentStatus.upsert({ where: { code: status.code }, update: {}, create: status });
    }
    console.log('... end seeding EquipmentStatus.\n');
}

async function seedGuides(): Promise<void> {
    console.log('🌱 Guide seeding ...');

    const carlosUser = await prisma.user.findUnique({ where: { email: 'carlos@guide.com' } });
    const sandraUser = await prisma.user.findUnique({ where: { email: 'sandra@guide.com' } });

    if (!carlosUser || !sandraUser) throw new Error('Usuaris guia no trobats. Executa seedUsers primer.');

    await prisma.guide.upsert({
        where: { userId: carlosUser.id_user },
        update: {},
        create: { userId: carlosUser.id_user, specialty: 'Senderisme i Muntanya', credentials: 'Llicència federativa núm. 1234' }
    });

    await prisma.guide.upsert({
        where: { userId: sandraUser.id_user },
        update: {},
        create: { userId: sandraUser.id_user, specialty: 'Activitats Aquàtiques i Neu', credentials: 'Llicència federativa núm. 5678' }
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
        await prisma.category.upsert({ where: { code: category.code }, update: {}, create: category });
    }
    console.log('... end seeding Category.\n');
}

async function seedActivities(): Promise<void> {
    console.log('🌱 Activity seeding ...');

    const carlosGuide = await prisma.guide.findFirst({ where: { user: { email: 'carlos@guide.com' } } });
    const sandraGuide = await prisma.guide.findFirst({ where: { user: { email: 'sandra@guide.com' } } });

    if (!carlosGuide || !sandraGuide) throw new Error('Guies no trobats. Executa seedGuides primer.');

    const hikingCat = await prisma.category.findUnique({ where: { code: 'HIKING' } });
    const mountainCat = await prisma.category.findUnique({ where: { code: 'MOUNTAIN' } });
    const aquaticCat = await prisma.category.findUnique({ where: { code: 'AQUATIC' } });
    const snowCat = await prisma.category.findUnique({ where: { code: 'SNOW' } });
    const campingCat = await prisma.category.findUnique({ where: { code: 'CAMPING' } });

    const activities = [
        // HIKING - Carlos
        {
            title: 'Ruta de les Fonts',
            description: 'Ruta guiada per les fonts naturals del riu.',
            init_date: new Date('2026-08-15T09:00:00Z'),
            end_date: new Date('2026-08-15T14:00:00Z'),
            difficulty: 30,
            max_participants: 15,
            start_end_point: 'Plaça de l\'Ajuntament',
            guideId: carlosGuide.id_guide,
            category: hikingCat
        },
        {
            title: 'Camí del Riu Verd',
            description: 'Senderisme tranquil seguint el curs del riu fins a la cascada.',
            init_date: new Date('2026-08-22T08:30:00Z'),
            end_date: new Date('2026-08-22T13:30:00Z'),
            difficulty: 20,
            max_participants: 20,
            start_end_point: 'Aparcament del Bosc',
            guideId: carlosGuide.id_guide,
            category: hikingCat
        },
        // MOUNTAIN - Carlos
        {
            title: 'Ascensió al Pic Major',
            description: 'Ruta tècnica d\'alta muntanya amb vistes panoràmiques.',
            init_date: new Date('2026-09-05T06:00:00Z'),
            end_date: new Date('2026-09-05T18:00:00Z'),
            difficulty: 80,
            max_participants: 8,
            start_end_point: 'Refugi de Muntanya',
            guideId: carlosGuide.id_guide,
            category: mountainCat
        },
        {
            title: 'Via Ferrata del Castell',
            description: 'Escalada guiada per una via ferrata amb ponts de mono i tirolina.',
            init_date: new Date('2026-09-12T08:00:00Z'),
            end_date: new Date('2026-09-12T15:00:00Z'),
            difficulty: 70,
            max_participants: 10,
            start_end_point: 'Base del Castell',
            guideId: carlosGuide.id_guide,
            category: mountainCat
        },
        // CAMPING - Carlos
        {
            title: 'Acampada Familiar al Bosc',
            description: 'Nit d\'acampada en família amb activitats de natura i foc de camp.',
            init_date: new Date('2026-08-29T17:00:00Z'),
            end_date: new Date('2026-08-30T11:00:00Z'),
            difficulty: 10,
            max_participants: 25,
            start_end_point: 'Zona d\'Acampada Les Planes',
            guideId: carlosGuide.id_guide,
            category: campingCat
        },
        {
            title: 'Bivac Sota les Estreles',
            description: 'Acampada nocturna d\'observació astronòmica en zona de baixa contaminació lumínica.',
            init_date: new Date('2026-09-19T20:00:00Z'),
            end_date: new Date('2026-09-20T08:00:00Z'),
            difficulty: 15,
            max_participants: 12,
            start_end_point: 'Mirador del Pla Alt',
            guideId: carlosGuide.id_guide,
            category: campingCat
        },
        // AQUATIC - Sandra
        {
            title: 'Caiac al Pantà',
            description: 'Ruta en caiac per les aigües tranquil·les del pantà amb parada per a banyar-se.',
            init_date: new Date('2026-08-08T10:00:00Z'),
            end_date: new Date('2026-08-08T14:00:00Z'),
            difficulty: 25,
            max_participants: 12,
            start_end_point: 'Club Nàutic del Pantà',
            guideId: sandraGuide.id_guide,
            category: aquaticCat
        },
        {
            title: 'Barranquisme al Riu Blau',
            description: 'Descens de barranc amb trams d\'escalada, rapel i salts a l\'aigua.',
            init_date: new Date('2026-08-16T09:00:00Z'),
            end_date: new Date('2026-08-16T16:00:00Z'),
            difficulty: 65,
            max_participants: 10,
            start_end_point: 'Pont Vell del Riu Blau',
            guideId: sandraGuide.id_guide,
            category: aquaticCat
        },
        // SNOW - Sandra
        {
            title: 'Raquetes de Neu al Port',
            description: 'Excursió amb raquetes de neu per paisatges nevats del port de muntanya.',
            init_date: new Date('2026-12-20T09:00:00Z'),
            end_date: new Date('2026-12-20T15:00:00Z'),
            difficulty: 40,
            max_participants: 15,
            start_end_point: 'Aparcament del Port de Neu',
            guideId: sandraGuide.id_guide,
            category: snowCat
        },
        {
            title: 'Iniciació a l\'Esquí de Fons',
            description: 'Taller d\'iniciació a l\'esquí de fons per a principiants en pistes balisades.',
            init_date: new Date('2026-12-27T10:00:00Z'),
            end_date: new Date('2026-12-27T15:00:00Z'),
            difficulty: 30,
            max_participants: 10,
            start_end_point: 'Centre Nòrdic de la Serra',
            guideId: sandraGuide.id_guide,
            category: snowCat
        },
    ];

    for (const { category, ...activityData } of activities) {
        const activity = await prisma.activity.create({ data: activityData });
        if (category) {
            await prisma.activity.update({
                where: { id_activity: activity.id_activity },
                data: { categories: { connect: { id_category: category.id_category } } }
            });
        }
    }

    console.log('... end seeding Activity.\n');
}

async function seedEquipment(): Promise<void> {
    console.log('🌱 Equipment seeding ...');

    const availableStatus = await prisma.equipmentStatus.findUnique({ where: { code: 'AVAILABLE' } });
    const unavailableStatus = await prisma.equipmentStatus.findUnique({ where: { code: 'UNAVAILABLE' } });

    if (!availableStatus || !unavailableStatus) throw new Error('Estats de material no trobats. Executa seedEquipmentStatuses primer.');

    const hikingCat = await prisma.category.findUnique({ where: { code: 'HIKING' } });
    const mountainCat = await prisma.category.findUnique({ where: { code: 'MOUNTAIN' } });
    const aquaticCat = await prisma.category.findUnique({ where: { code: 'AQUATIC' } });
    const snowCat = await prisma.category.findUnique({ where: { code: 'SNOW' } });
    const campingCat = await prisma.category.findUnique({ where: { code: 'CAMPING' } });

    const equipment = [
        // HIKING
        { title: 'Bastons de trekking', description: 'Bastons de trekking d\'alumini lleuger, alçada regulable', price_per_day: 5.00, units: 10, statusId: availableStatus.id_status, category: hikingCat },
        { title: 'Motxilla de senderisme 45L', description: 'Motxilla impermeable amb sistema dorsal ergonòmic', price_per_day: 8.00, units: 5, statusId: availableStatus.id_status, category: hikingCat },
        // MOUNTAIN
        { title: 'Arnès d\'escalada', description: 'Arnès homologat per a via ferrata i escalada esportiva', price_per_day: 6.00, units: 8, statusId: availableStatus.id_status, category: mountainCat },
        { title: 'Casc multiesport', description: 'Casc lleuger multiesport amb ajust regulable', price_per_day: 4.00, units: 8, statusId: availableStatus.id_status, category: mountainCat },
        // AQUATIC
        { title: 'Caiac individual', description: 'Caiac estable per a aigües tranquil·les, inclou rem', price_per_day: 20.00, units: 6, statusId: availableStatus.id_status, category: aquaticCat },
        { title: 'Neoprè 3mm', description: 'Vestit de neoprè complet per a temperatures de l\'aigua per damunt dels 18°C', price_per_day: 10.00, units: 8, statusId: availableStatus.id_status, category: aquaticCat },
        // SNOW
        { title: 'Raquetes de neu', description: 'Raquetes de neu d\'alumini per a terreny variat, fixació regulable', price_per_day: 12.00, units: 10, statusId: availableStatus.id_status, category: snowCat },
        { title: 'Equip d\'esquí nòrdic', description: 'Equip complet d\'esquí nòrdic clàssic amb botes i bastons', price_per_day: 18.00, units: 6, statusId: unavailableStatus.id_status, category: snowCat },
        // CAMPING
        { title: 'Tenda de campanya 2 persones', description: 'Tenda de 3 estacions, muntatge fàcil, 2kg', price_per_day: 15.00, units: 3, statusId: availableStatus.id_status, category: campingCat },
        { title: 'Sac de dormir -5°C', description: 'Sac de dormir sintètic homologat fins a -5°C, inclou funda de compressió', price_per_day: 7.00, units: 8, statusId: availableStatus.id_status, category: campingCat },
    ];

    for (const { category, ...itemData } of equipment) {
        const created = await prisma.equipment.create({ data: itemData });
        if (category) {
            await prisma.equipment.update({
                where: { id_equipment: created.id_equipment },
                data: { categories: { connect: { id_category: category.id_category } } }
            });
        }
    }

    console.log('... end seeding Equipment.\n');
}

async function seedBookings(): Promise<void> {
    console.log('🌱 Booking seeding ...');

    const lolaUser = await prisma.user.findUnique({ where: { email: 'lola@user.com' } });
    const marcUser = await prisma.user.findUnique({ where: { email: 'marc@user.com' } });
    const carlosUser = await prisma.user.findUnique({ where: { email: 'carlos@guide.com' } });
    const sandraUser = await prisma.user.findUnique({ where: { email: 'sandra@guide.com' } });

    if (!lolaUser || !marcUser || !carlosUser || !sandraUser) {
        throw new Error('Usuaris no trobats. Executa seedUsers primer.');
    }

    const pendingStatus = await prisma.bookingStatus.findUnique({ where: { code: 'PENDING' } });
    const acceptedStatus = await prisma.bookingStatus.findUnique({ where: { code: 'ACCEPTED' } });
    const inProgressStatus = await prisma.bookingStatus.findUnique({ where: { code: 'IN_PROGRESS' } });
    const finishedStatus = await prisma.bookingStatus.findUnique({ where: { code: 'FINISHED' } });
    const cancelledStatus = await prisma.bookingStatus.findUnique({ where: { code: 'CANCELLED' } });

    if (!pendingStatus || !acceptedStatus || !inProgressStatus || !finishedStatus || !cancelledStatus) {
        throw new Error('Estats de reserva no trobats. Executa seedBookingStatuses primer.');
    }

    const bastons = await prisma.equipment.findFirst({ where: { title: 'Bastons de trekking' } });
    const motxilla = await prisma.equipment.findFirst({ where: { title: 'Motxilla de senderisme 45L' } });
    const caiac = await prisma.equipment.findFirst({ where: { title: 'Caiac individual' } });
    const tenda = await prisma.equipment.findFirst({ where: { title: 'Tenda de campanya 2 persones' } });
    const raquetes = await prisma.equipment.findFirst({ where: { title: 'Raquetes de neu' } });

    const rutaFonts = await prisma.activity.findFirst({ where: { title: 'Ruta de les Fonts' } });
    const caiacActivitat = await prisma.activity.findFirst({ where: { title: 'Caiac al Pantà' } });
    const ascensio = await prisma.activity.findFirst({ where: { title: 'Ascensió al Pic Major' } });
    const raquetesActivitat = await prisma.activity.findFirst({ where: { title: 'Raquetes de Neu al Port' } });
    const acampada = await prisma.activity.findFirst({ where: { title: 'Acampada Familiar al Bosc' } });

    if (!bastons || !motxilla || !caiac || !tenda || !raquetes ||
        !rutaFonts || !caiacActivitat || !ascensio || !raquetesActivitat || !acampada) {
        throw new Error('Material o activitats no trobats. Executa seedEquipment i seedActivities primer.');
    }

    // Reserva 1 — Lola, PENDING, activitat Ruta de les Fonts (2 places) + bastons
    const booking1 = await prisma.booking.create({
        data: {
            userId: lolaUser.id_user,
            statusId: pendingStatus.id_book_status,
            total_price: 5.00,
            init_date: rutaFonts.init_date,
            end_date: rutaFonts.end_date,
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking1.id_booking, activityId: rutaFonts.id_activity, quantity: 2, price_at_moment: 0 }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking1.id_booking, equipmentId: bastons.id_equipment, quantity: 2, price_at_moment: 5.00 }
    });

    // Reserva 2 — Lola, ACCEPTED, activitat Caiac al Pantà (1 plaça) + caiac
    const booking2 = await prisma.booking.create({
        data: {
            userId: lolaUser.id_user,
            statusId: acceptedStatus.id_book_status,
            total_price: 20.00,
            init_date: caiacActivitat.init_date,
            end_date: caiacActivitat.end_date,
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking2.id_booking, activityId: caiacActivitat.id_activity, quantity: 1, price_at_moment: 0 }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking2.id_booking, equipmentId: caiac.id_equipment, quantity: 1, price_at_moment: 20.00 }
    });

    // Reserva 3 — Lola, CANCELLED, sols material (motxilla)
    const booking3 = await prisma.booking.create({
        data: {
            userId: lolaUser.id_user,
            statusId: cancelledStatus.id_book_status,
            total_price: 16.00,
            init_date: new Date('2026-07-10T08:00:00Z'),
            end_date: new Date('2026-07-12T18:00:00Z'),
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking3.id_booking, equipmentId: motxilla.id_equipment, quantity: 1, price_at_moment: 16.00 }
    });

    // Reserva 4 — Marc, PENDING, activitat Ascensió al Pic Major (3 places)
    const booking4 = await prisma.booking.create({
        data: {
            userId: marcUser.id_user,
            statusId: pendingStatus.id_book_status,
            total_price: 0,
            init_date: ascensio.init_date,
            end_date: ascensio.end_date,
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking4.id_booking, activityId: ascensio.id_activity, quantity: 3, price_at_moment: 0 }
    });

    // Reserva 5 — Marc, FINISHED, activitat Acampada Familiar + tenda
    const booking5 = await prisma.booking.create({
        data: {
            userId: marcUser.id_user,
            statusId: finishedStatus.id_book_status,
            total_price: 15.00,
            init_date: new Date('2026-06-20T17:00:00Z'),
            end_date: new Date('2026-06-21T11:00:00Z'),
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking5.id_booking, activityId: acampada.id_activity, quantity: 2, price_at_moment: 0 }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking5.id_booking, equipmentId: tenda.id_equipment, quantity: 1, price_at_moment: 15.00 }
    });

    // Reserva 6 — Carlos (guia actuant com a usuari), ACCEPTED, Raquetes de Neu al Port + raquetes
    const booking6 = await prisma.booking.create({
        data: {
            userId: carlosUser.id_user,
            statusId: acceptedStatus.id_book_status,
            total_price: 12.00,
            init_date: raquetesActivitat.init_date,
            end_date: raquetesActivitat.end_date,
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking6.id_booking, activityId: raquetesActivitat.id_activity, quantity: 1, price_at_moment: 0 }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking6.id_booking, equipmentId: raquetes.id_equipment, quantity: 1, price_at_moment: 12.00 }
    });

    // Reserva 7 — Sandra (guia actuant com a usuari), IN_PROGRESS, sols material (motxilles)
    const booking7 = await prisma.booking.create({
        data: {
            userId: sandraUser.id_user,
            statusId: inProgressStatus.id_book_status,
            total_price: 16.00,
            init_date: new Date('2026-05-24T08:00:00Z'),
            end_date: new Date('2026-05-26T18:00:00Z'),
        }
    });
    await prisma.bookingLine.create({
        data: { bookingId: booking7.id_booking, equipmentId: motxilla.id_equipment, quantity: 2, price_at_moment: 16.00 }
    });

    console.log('... end seeding Booking.\n');
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
        await seedBookings();

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