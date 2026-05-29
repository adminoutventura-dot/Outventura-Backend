import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateActivityDto, currentUser: any) {
    const { guideId, categoryCodes, recommendedEquipmentIds, ...rest } = dto;
    const currentRole = currentUser.role.code;
    const now = new Date();
    const initDate = new Date(dto.init_date);

    if (currentRole === 'ADMIN') {
      const hoursUntil = (initDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntil < 48) {
        throw new BadRequestException('Com a ADMIN, la data d\'inici ha d\'estar a més de 48h des d\'ara');
      }
    } else if (currentRole === 'GUIDE') {
      const daysUntil = (initDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntil < 7) {
        throw new BadRequestException('Com a GUIDE, la data d\'inici ha d\'estar a més d\'una setmana des d\'ara');
      }
    }

    const guide = await this.prisma.guide.findUnique({
      where: { id_guide: guideId },
      include: { user: true }
    });
    if (!guide) throw new NotFoundException('Guia no trobat');
    if (!guide.user.status) throw new BadRequestException('El guia seleccionat està inactiu');

    if (currentRole === 'GUIDE' && guide.userId !== currentUser.id_user) {
      throw new ForbiddenException('Només pots crear activitats on tu ets el guia assignat');
    }

    await this.validateGuideAvailability(guideId, dto.init_date, dto.end_date, null);

    const activity = await this.prisma.activity.create({
      data: {
        ...rest,
        guide: { connect: { id_guide: guideId } },
        ...(categoryCodes && categoryCodes.length > 0 && {
          categories: { connect: categoryCodes.map(code => ({ code })) }
        }),
        ...(recommendedEquipmentIds && recommendedEquipmentIds.length > 0 && {
          recomendedEquipments: { connect: recommendedEquipmentIds.map(id => ({ id_equipment: id })) }
        })
      },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true,
        recomendedEquipments: true
      }
    });

    return this.addNumParticipants(activity);
  }

  async addCategoryToActivity(activityId: number, categoryId: number) {
    const activity = await this.prisma.activity.update({
      where: { id_activity: activityId },
      data: { categories: { connect: { id_category: categoryId } } },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true,
        recomendedEquipments: true
      }
    });

    return this.addNumParticipants(activity);
  }

  async findAll(filters?: {
    guideId?: number;
    difficulty?: number;
    categoryId?: number;
    page?: number;
    limit?: number;
    available?: boolean;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where = {
      ...(filters?.guideId && { guideId: filters.guideId }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
      ...(filters?.categoryId && {
        categories: { some: { id_category: filters.categoryId } }
      }),
      ...(filters?.available && { init_date: { gt: now } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        include: {
          guide: { include: { user: { select: { name: true, surname: true } } } },
          categories: true,
          recomendedEquipments: true
        }
      }),
      this.prisma.activity.count({ where })
    ]);

    const dataWithParticipants = await Promise.all(
      data.map(activity => this.addNumParticipants(activity))
    );

    return {
      data: dataWithParticipants,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id_activity: id },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true,
        recomendedEquipments: true
      }
    });
    if (!activity) throw new NotFoundException(`Activitat ${id} no trobada`);

    return this.addNumParticipants(activity);
  }

  async update(id: number, dto: Partial<CreateActivityDto>, currentUser: any) {
    const activity = await this.findOne(id);
    const currentRole = currentUser.role.code;

    if (currentRole === 'GUIDE') {
      const guideProfile = await this.prisma.guide.findUnique({
        where: { userId: currentUser.id_user }
      });
      if (!guideProfile || (activity as any).guideId !== guideProfile.id_guide) {
        throw new ForbiddenException('Només pots modificar activitats de les quals ets el guia');
      }
    }

    if (dto.init_date || dto.end_date) {
      if (currentRole === 'SUPER') {
        const activeBookings = await this.prisma.bookingLine.count({
          where: {
            activityId: id,
            booking: { status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }
          }
        });
        if (activeBookings > 0) {
          throw new BadRequestException('No es pot canviar la data. L\'activitat té reserves actives.');
        }
      } else {
        const anyBooking = await this.prisma.bookingLine.count({
          where: { activityId: id }
        });
        if (anyBooking > 0) {
          throw new BadRequestException('No es pot canviar la data. L\'activitat té reserves associades.');
        }
      }
    }

    if (dto.max_participants !== undefined && currentRole === 'SUPER') {
      const activeCount = await this.prisma.bookingLine.aggregate({
        where: {
          activityId: id,
          booking: { status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }
        },
        _sum: { quantity: true }
      });
      const total = activeCount._sum?.quantity ?? 0;
      if (dto.max_participants < total) {
        throw new BadRequestException(
          `No es pot baixar l\'aforament per sota de ${total} (participants actuals)`
        );
      }
    }

    if (dto.guideId) {
      const guide = await this.prisma.guide.findUnique({
        where: { id_guide: dto.guideId },
        include: { user: true }
      });
      if (!guide) throw new NotFoundException('Guia no trobat');
      if (!guide.user.status) throw new BadRequestException('El guia seleccionat està inactiu');

      const initDate = dto.init_date ?? (activity as any).init_date;
      const endDate = dto.end_date ?? (activity as any).end_date;
      await this.validateGuideAvailability(dto.guideId, initDate, endDate, id);
    }

    const { categoryCodes, recommendedEquipmentIds, guideId, ...rest } = dto;

    const updated = await this.prisma.activity.update({
      where: { id_activity: id },
      data: {
        ...rest,
        ...(guideId && { guide: { connect: { id_guide: guideId } } }),
        ...(categoryCodes !== undefined && {
          categories: { set: categoryCodes.map(code => ({ code })) }
        }),
        ...(recommendedEquipmentIds !== undefined && {
          recomendedEquipments: { set: recommendedEquipmentIds.map(id => ({ id_equipment: id })) }
        })
      },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true,
        recomendedEquipments: true
      }
    });

    return this.addNumParticipants(updated);
  }

  async remove(id: number, currentUser: any) {
    const activity = await this.findOne(id);
    const currentRole = currentUser.role.code;

    if (currentRole === 'GUIDE') {
      const guideProfile = await this.prisma.guide.findUnique({
        where: { userId: currentUser.id_user }
      });
      if (!guideProfile || (activity as any).guideId !== guideProfile.id_guide) {
        throw new ForbiddenException('Només pots eliminar activitats de les quals ets el guia');
      }
    }

    const anyBooking = await this.prisma.bookingLine.count({
      where: { activityId: id }
    });
    if (anyBooking > 0) {
      throw new BadRequestException('No es pot eliminar l\'activitat perquè té reserves associades');
    }

    return this.prisma.activity.delete({ where: { id_activity: id } });
  }

  // Mètode privat que calcula num_participants en temps real
  private async addNumParticipants(activity: any) {
    const result = await this.prisma.bookingLine.aggregate({
      where: {
        activityId: activity.id_activity,
        booking: {
          status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } }
        }
      },
      _sum: { quantity: true }
    });

    return {
      ...activity,
      num_participants: result._sum?.quantity ?? 0
    };
  }

  private async validateGuideAvailability(
    guideId: number,
    initDate: any,
    endDate: any,
    excludeActivityId: number | null
  ) {
    const conflictingActivity = await this.prisma.activity.findFirst({
      where: {
        guideId,
        ...(excludeActivityId && { id_activity: { not: excludeActivityId } }),
        AND: [
          { init_date: { lte: new Date(endDate) } },
          { end_date: { gte: new Date(initDate) } }
        ]
      }
    });

    if (conflictingActivity) {
      throw new BadRequestException(
        `El guia ja té assignada l\'activitat "${conflictingActivity.title}" per a aquestes dates`
      );
    }

    const guide = await this.prisma.guide.findUnique({ where: { id_guide: guideId } });
    if (guide) {
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          userId: guide.userId,
          status: { code: { in: ['PENDING', 'ACCEPTED'] } },
          AND: [
            { init_date: { lte: new Date(endDate) } },
            { end_date: { gte: new Date(initDate) } }
          ]
        }
      });

      if (conflictingBooking) {
        throw new BadRequestException(
          `El guia ja té una reserva personal per a aquestes dates (reserva #${conflictingBooking.id_booking})`
        );
      }
    }
  }
}