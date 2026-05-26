import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) { }

  async findAll(filters?: {
    method?: string;
    userId?: number;
    statusCode?: number;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.method && { method: filters.method }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.statusCode && { statusCode: filters.statusCode }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async remove(id: number) {
    return this.prisma.activityLog.delete({
      where: { id }
    });
  }

  async clear() {
    return this.prisma.activityLog.deleteMany({});
  }
}