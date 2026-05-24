import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateActivityDto, currentUser: any) {
    const { guideId, ...rest } = dto;
    const currentRole = currentUser.role.code;
    const now = new Date();
    const initDate = new Date(dto.init_date);

    // Restriccions de temps per rol
    if (currentRole === 'ADMIN') {
      const hoursUntil = (initDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntil < 48) {
        throw new BadRequestException('Com a ADMIN, la data d\'inici ha d\'estar a més de 48h des d\'ara');
      }
    }
    else if (currentRole === 'GUIDE') {
      const daysUntil = (initDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntil < 7) {
        throw new BadRequestException('Com a GUIDE, la data d\'inici ha d\'estar a més d\'una setmana des d\'ara');
      }
    }

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

    // GUIDE només pot crear activitats on ell és el guia assignat
    if (currentRole === 'GUIDE' && guide.userId !== currentUser.id_user) {
      throw new ForbiddenException('Només pots crear activitats on tu ets el guia assignat');
    }

    // Validació conflicte de dates del guia
    await this.validateGuideAvailability(guideId, dto.init_date, dto.end_date, null);

    return this.prisma.activity.create({
      data: { ...rest, guide: { connect: { id_guide: guideId } } },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
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
          categories: true
        }
      }),
      this.prisma.activity.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: number) {
    const activity = await this.prisma.activity.findUnique({
      where: { id_activity: id },
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true
      }
    });

    if (!activity) {
      throw new NotFoundException(`Activitat ${id} no trobada`);
    }

    return activity;
  }

  async update(id: number, dto: Partial<CreateActivityDto>, currentUser: any) {
    const activity = await this.findOne(id);
    const currentRole = currentUser.role.code;

    // GUIDE → només si ell és el guia assignat
    if (currentRole === 'GUIDE') {
      const guideProfile = await this.prisma.guide.findUnique({
        where: { userId: currentUser.id_user }
      });

      if (!guideProfile || (activity as any).guideId !== guideProfile.id_guide) {
        throw new ForbiddenException('Només pots modificar activitats de les quals ets el guia');
      }
    }

    // Restriccions sobre canvi de data
    if (dto.init_date || dto.end_date) {
      if (currentRole === 'SUPER') {
        // SUPER no pot canviar data si té reserves actives
        const activeBookings = await this.prisma.bookingLine.count({
          where: {
            activityId: id,
            booking: { status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }
          }
        });

        if (activeBookings > 0) {
          throw new BadRequestException(
            'No es pot canviar la data. L\'activitat té reserves actives.'
          );
        }
      }
      else {
        // ADMIN i GUIDE no poden canviar data si té qualsevol reserva
        const anyBooking = await this.prisma.bookingLine.count({
          where: { activityId: id }
        });

        if (anyBooking > 0) {
          throw new BadRequestException(
            'No es pot canviar la data. L\'activitat té reserves associades.'
          );
        }
      }
    }

    // SUPER no pot baixar max_participants per sota del nombre de reserves actives
    if (dto.max_participants !== undefined && currentRole === 'SUPER') {
      const activeCount = await this.prisma.bookingLine.count({
        where: {
          activityId: id,
          booking: { status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }
        }
      });

      if (dto.max_participants < activeCount) {
        throw new BadRequestException(
          `No es pot baixar l\'aforament per sota de ${activeCount} (reserves actives actuals)`
        );
      }
    }

    // Validació guia actiu si canvia
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

      // Validació conflicte de dates del nou guia
      const initDate = dto.init_date ?? (activity as any).init_date;
      const endDate = dto.end_date ?? (activity as any).end_date;

      await this.validateGuideAvailability(dto.guideId, initDate, endDate, id);
    }

    return this.prisma.activity.update({
      where: { id_activity: id },
      data: dto,
      include: {
        guide: { include: { user: { select: { name: true, surname: true } } } },
        categories: true
      }
    });
  }

  async remove(id: number, currentUser: any) {
    const activity = await this.findOne(id);
    const currentRole = currentUser.role.code;

    // GUIDE → només si ell és el guia assignat
    if (currentRole === 'GUIDE') {
      const guideProfile = await this.prisma.guide.findUnique({
        where: { userId: currentUser.id_user }
      });

      if (!guideProfile || (activity as any).guideId !== guideProfile.id_guide) {
        throw new ForbiddenException('Només pots eliminar activitats de les quals ets el guia');
      }
    }

    // No es pot eliminar si té qualsevol reserva
    const anyBooking = await this.prisma.bookingLine.count({
      where: { activityId: id }
    });

    if (anyBooking > 0) {
      throw new BadRequestException(
        'No es pot eliminar l\'activitat perquè té reserves associades'
      );
    }

    return this.prisma.activity.delete({ where: { id_activity: id } });
  }

  private async validateGuideAvailability(
    guideId: number,
    initDate: any,
    endDate: any,
    excludeActivityId: number | null
  ) {
    // Comprova que el guia no té altra activitat en les mateixes dates
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

    // Comprova que el guia no té una reserva personal en les mateixes dates
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