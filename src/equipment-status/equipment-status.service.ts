// equipment-status.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentStatusDto } from './dto/create-equipment-status.dto';

@Injectable()
export class EquipmentStatusService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateEquipmentStatusDto) {
    const existing = await this.prisma.equipmentStatus.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`L'estat amb codi ${dto.code} ja existeix.`);
    }

    return this.prisma.equipmentStatus.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.equipmentStatus.findMany();
  }

  async findOne(id: number) {
    const status = await this.prisma.equipmentStatus.findUnique({
      where: { id_status: id },
    });
    if (!status) throw new NotFoundException(`Estat amb ID ${id} no trobat`);
    return status;
  }

  async update(id: number, dto: Partial<CreateEquipmentStatusDto>) {
    return this.prisma.equipmentStatus.update({
      where: { id_status: id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.equipmentStatus.delete({
      where: { id_status: id },
    });
  }
}