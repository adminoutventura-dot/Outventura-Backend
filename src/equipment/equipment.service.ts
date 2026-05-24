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

    if (!statusExists) {
      throw new NotFoundException('Estat de material no trobat');
    }

    return this.prisma.equipment.create({
      data: dto,
      include: { status: true, categories: true }
    });
  }

  async addCategoryToEquipment(equipmentId: number, categoryId: number) {
    await this.findOne(equipmentId);

    return this.prisma.equipment.update({
      where: { id_equipment: equipmentId },
      data: { categories: { connect: { id_category: categoryId } } },
      include: { status: true, categories: true }
    });
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

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.equipment.findUnique({
      where: { id_equipment: id },
      include: { status: true, categories: true }
    });

    if (!item) {
      throw new NotFoundException(`Material amb ID ${id} no trobat`);
    }

    return item;
  }

  async update(id: number, dto: Partial<CreateEquipmentDto>) {
    await this.findOne(id);

    if (dto.statusId) {
      const statusExists = await this.prisma.equipmentStatus.findUnique({
        where: { id_status: dto.statusId }
      });

      if (!statusExists) {
        throw new NotFoundException('Estat de material no trobat');
      }
    }

    return this.prisma.equipment.update({
      where: { id_equipment: id },
      data: dto,
      include: { status: true, categories: true }
    });
  }

  async changeStatus(id: number, statusId: number) {
    await this.findOne(id);

    const status = await this.prisma.equipmentStatus.findUnique({
      where: { id_status: statusId }
    });

    if (!status) {
      throw new NotFoundException('Estat de material no trobat');
    }

    return this.prisma.equipment.update({
      where: { id_equipment: id },
      data: { statusId },
      include: { status: true, categories: true }
    });
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

    return this.prisma.equipment.update({
      where: { id_equipment: id },
      data: { statusId: discontinued.id_status },
      include: { status: true, categories: true }
    });
  }
}