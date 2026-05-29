import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateEquipmentDto) {
    const statusExists = await this.prisma.equipmentStatus.findUnique({
      where: { id_status: dto.statusId }
    });
    if (!statusExists) throw new NotFoundException('Estat de material no trobat');

    const { categoryCodes, ...equipmentData } = dto;

    const equipment = await this.prisma.equipment.create({
      data: {
        ...equipmentData,
        ...(categoryCodes && categoryCodes.length > 0 && {
          categories: { connect: categoryCodes.map(code => ({ code })) }
        })
      },
      include: { status: true, categories: true }
    });

    return this.addAvailableUnits(equipment);
  }

  async addCategoryToEquipment(equipmentId: number, categoryId: number) {
    await this.findOne(equipmentId);

    const equipment = await this.prisma.equipment.update({
      where: { id_equipment: equipmentId },
      data: { categories: { connect: { id_category: categoryId } } },
      include: { status: true, categories: true }
    });

    return this.addAvailableUnits(equipment);
  }

  async findAll(
    filters?: { categoryId?: number; statusId?: number; page?: number; limit?: number },
    userRole?: string
  ) {
    const isAdminOrSuper = userRole === 'ADMIN' || userRole === 'SUPER';
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(!isAdminOrSuper && {
        status: { code: { not: 'DISCONTINUED' } }
      }),
      ...(filters?.statusId && { statusId: filters.statusId }),
      ...(filters?.categoryId && {
        categories: { some: { id_category: filters.categoryId } }
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        include: { status: true, categories: true }
      }),
      this.prisma.equipment.count({ where })
    ]);

    const dataWithAvailability = await Promise.all(
      data.map(item => this.addAvailableUnits(item))
    );

    return {
      data: dataWithAvailability,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.equipment.findUnique({
      where: { id_equipment: id },
      include: { status: true, categories: true }
    });
    if (!item) throw new NotFoundException(`Material amb ID ${id} no trobat`);

    return this.addAvailableUnits(item);
  }

  async update(id: number, dto: Partial<CreateEquipmentDto>) {
    await this.findOne(id);

    if (dto.statusId) {
      const statusExists = await this.prisma.equipmentStatus.findUnique({
        where: { id_status: dto.statusId }
      });
      if (!statusExists) throw new NotFoundException('Estat de material no trobat');
    }

    const { categoryCodes, ...equipmentData } = dto;

    const equipment = await this.prisma.equipment.update({
      where: { id_equipment: id },
      data: {
        ...equipmentData,
        ...(categoryCodes !== undefined && {
          categories: { set: categoryCodes.map(code => ({ code })) }
        })
      },
      include: { status: true, categories: true }
    });

    return this.addAvailableUnits(equipment);
  }

  async changeStatus(id: number, statusId: number) {
    await this.findOne(id);

    const status = await this.prisma.equipmentStatus.findUnique({
      where: { id_status: statusId }
    });
    if (!status) throw new NotFoundException('Estat de material no trobat');

    const equipment = await this.prisma.equipment.update({
      where: { id_equipment: id },
      data: { statusId },
      include: { status: true, categories: true }
    });

    return this.addAvailableUnits(equipment);
  }

  async remove(id: number) {
    await this.findOne(id);

    const discontinued = await this.prisma.equipmentStatus.upsert({
      where: { code: 'DISCONTINUED' },
      update: {},
      create: {
        code: 'DISCONTINUED',
        description: 'El material ja no està disponible per a lloguer'
      }
    });

    const equipment = await this.prisma.equipment.update({
      where: { id_equipment: id },
      data: { statusId: discontinued.id_status },
      include: { status: true, categories: true }
    });

    return this.addAvailableUnits(equipment);
  }

  // Mètode privat que calcula available_units en temps real
  private async addAvailableUnits(equipment: any) {
    const now = new Date();

    const reserved = await this.prisma.bookingLine.aggregate({
      where: {
        equipmentId: equipment.id_equipment,
        booking: {
          status: { code: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
          AND: [
            { init_date: { lte: now } },
            { end_date: { gte: now } }
          ]
        }
      },
      _sum: { quantity: true }
    });

    const reservedUnits = reserved._sum?.quantity ?? 0;

    return {
      ...equipment,
      available_units: equipment.total_units - reservedUnits
    };
  }
}