import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: dto,
    });
  }

  async addCategoryToActivity(activityId: number, categoryId: number) {
    return this.prisma.activity.update({
      where: { id_activity: activityId },
      data: {
        categories: {
          connect: { id_category: categoryId }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.activity.findMany({
      include: { categories: true }
    });
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id_activity: id },
      include: { categories: true }
    });
    if (!activity) throw new NotFoundException(`Activitat ${id} no trobada`);
    return activity;
  }

  async update(id: number, dto: Partial<CreateActivityDto>) {
    return this.prisma.activity.update({
      where: { id_activity: id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.activity.delete({
      where: { id_activity: id },
    });
  }
}