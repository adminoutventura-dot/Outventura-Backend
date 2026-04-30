import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`La categoria amb codi ${dto.code} ja existeix.`);
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { equipments: true, activities: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
      include: {
        equipments: true,
        activities: true,
      },
    });

    if (!category) throw new NotFoundException(`Categoria amb ID ${id} no trobada`);
    return category;
  }

  async update(id: number, dto: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({
      where: { id_category: id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id_category: id },
    });
  }
}