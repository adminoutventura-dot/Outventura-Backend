import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateActivityDto) {
    const { guideId, ...rest } = dto;

    const guide = await this.prisma.guide.findUnique({
      where: { id_guide: guideId },
      include: { user: true }
    });

    if (!guide) {
      throw new NotFoundException('Guia no trobat');
    }
    if (!guide.user.status) {
      throw new BadRequestException('El guia seleccionat està inactiu');
    }

    return this.prisma.activity.create({
      data: {
        ...rest,
        guide: { connect: { id_guide: guideId } }
      },
      include: {
        guide: {
          include: {
            user: { select: { name: true, surname: true } }
          }
        },
        categories: true
      }
    });
  }

  async addCategoryToActivity(activityId: number, categoryId: number) {
    return this.prisma.activity.update({
      where: { id_activity: activityId },
      data: { categories: { connect: { id_category: categoryId } } }
    });
  }

  async findAll(filters?: { guideId?: number; difficulty?: number; categoryId?: number }) {
    return this.prisma.activity.findMany({
      where: {
        ...(filters?.guideId && { guideId: filters.guideId }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.categoryId && {
          categories: { some: { id_category: filters.categoryId } }
        }),
      },
      include: {
        guide: {
          include: {
            user: { select: { name: true, surname: true } }
          }
        },
        categories: true
      }
    });
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id_activity: id },
      include: {
        guide: {
          include: {
            user: { select: { name: true, surname: true } }
          }
        },
        categories: true
      }
    });

    if (!activity) {
      throw new NotFoundException(`Activitat ${id} no trobada`);
    }

    return activity;
  }

  async update(id: number, dto: Partial<CreateActivityDto>) {
    await this.findOne(id);

    if (dto.guideId) {
      const guide = await this.prisma.guide.findUnique({
        where: { id_guide: dto.guideId },
        include: { user: true }
      });

      if (!guide) {
        throw new NotFoundException('Guia no trobat');
      }
      if (!guide.user.status) {
        throw new BadRequestException('El guia seleccionat està inactiu');
      }
    }

    return this.prisma.activity.update({
      where: { id_activity: id },
      data: dto,
      include: {
        guide: {
          include: {
            user: { select: { name: true, surname: true } }
          }
        },
        categories: true
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.activity.delete({ where: { id_activity: id } });
  }
}