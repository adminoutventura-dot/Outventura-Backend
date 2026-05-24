import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id_user: dto.userId } });

    if (!user) {
      throw new NotFoundException('Usuari no trobat');
    }

    if (!user.status) {
      throw new BadRequestException(
        'El teu perfil està inactiu temporalment. Contacta amb un administrador.'
      );
    }

    const pendingStatus = await this.prisma.bookingStatus.findUnique({
      where: { code: 'PENDING' }
    });

    if (!pendingStatus) {
      throw new NotFoundException('Estat PENDING no trobat al sistema');
    }

    return this.prisma.booking.create({
      data: {
        user: { connect: { id_user: dto.userId } },
        status: { connect: { id_book_status: pendingStatus.id_book_status } },
        total_price: 0,
        init_date: new Date(dto.init_date),
        end_date: new Date(dto.end_date),
      },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: true
      }
    });
  }

  async findAll(
    filters?: { userId?: number; guideId?: number; date?: string; status?: string; page?: number; limit?: number },
    currentUser?: any
  ) {
    const currentRole = currentUser?.role?.code;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(currentRole === 'USER' && { userId: currentUser.id_user }),
      ...(currentRole === 'GUIDE' && {
        OR: [
          { userId: currentUser.id_user },
          { lines: { some: { activity: { guide: { userId: currentUser.id_user } } } } }
        ]
      }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.status && { status: { code: filters.status } }),
      ...(filters?.date && {
        init_date: {
          gte: new Date(filters.date + 'T00:00:00Z'),
          lte: new Date(filters.date + 'T23:59:59Z'),
        }
      }),
      ...(filters?.guideId && {
        lines: { some: { activity: { guideId: filters.guideId } } }
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          status: true,
          lines: { include: { equipment: true, activity: true } }
        }
      }),
      this.prisma.booking.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: id },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: { include: { equipment: true, activity: true } }
      }
    });

    if (!booking) {
      throw new NotFoundException('Reserva no trobada');
    }

    return booking;
  }

  async update(id: number, dto: UpdateBookingDto, currentUser: any) {
    const booking = await this.findOne(id);
    const currentStatus = (booking.status as any).code;
    const currentRole = currentUser.role.code;

    if (currentRole === 'GUIDE') {
      const guideProfile = await this.prisma.guide.findUnique({
        where: { userId: currentUser.id_user }
      });

      const hasGuideActivity = (booking.lines as any[]).some(
        line => line.activity?.guideId === guideProfile?.id_guide
      );

      if (!hasGuideActivity) {
        throw new ForbiddenException('No tens permisos per gestionar aquesta reserva');
      }
    }

    const newStatus = await this.prisma.bookingStatus.findUnique({
      where: { id_book_status: dto.statusId }
    });

    if (!newStatus) {
      throw new NotFoundException('Estat de reserva no trobat');
    }

    const newStatusCode = newStatus.code;

    const validTransitions: Record<string, string[]> = {
      'PENDING': ['ACCEPTED', 'CANCELLED'],
      'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['FINISHED'],
      'FINISHED': [],
      'CANCELLED': [],
    };

    if (['FINISHED', 'CANCELLED'].includes(currentStatus)) {
      if (currentRole !== 'SUPER') {
        throw new ForbiddenException(
          `No es pot canviar l\'estat d\'una reserva ${currentStatus}. Contacta amb un superadministrador.`
        );
      }
    } else {
      const allowed = validTransitions[currentStatus] || [];

      if (!allowed.includes(newStatusCode)) {
        throw new BadRequestException(
          `No es pot canviar l\'estat de ${currentStatus} a ${newStatusCode}. Transicions permeses: ${allowed.join(', ')}`
        );
      }
    }

    if (newStatusCode === 'ACCEPTED') {
      await this.validateMaterialAvailability(booking);
    }

    if (newStatusCode === 'CANCELLED' && !['SUPER', 'ADMIN'].includes(currentRole)) {
      await this.validateCancellationTime(booking);
    }

    return this.prisma.booking.update({
      where: { id_booking: id },
      data: { status: { connect: { id_book_status: dto.statusId } } },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: { include: { equipment: true, activity: true } }
      }
    });
  }

  private async validateMaterialAvailability(booking: any) {
    const equipmentLines = booking.lines.filter((l: any) => l.equipmentId);

    for (const line of equipmentLines) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id_equipment: line.equipmentId }
      });
      if (!equipment) continue;

      const reservedUnits = await this.prisma.bookingLine.aggregate({
        where: {
          equipmentId: line.equipmentId,
          booking: {
            id_booking: { not: booking.id_booking },
            status: { code: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
            AND: [
              { init_date: { lte: booking.end_date } },
              { end_date: { gte: booking.init_date } }
            ]
          }
        },
        _sum: { quantity: true }
      });

      const reserved = reservedUnits._sum.quantity ?? 0;
      const available = equipment.units - reserved;

      if (line.quantity > available) {
        throw new BadRequestException(
          `No hi ha suficients unitats de "${equipment.title}" disponibles. ` +
          `Sol·licitades: ${line.quantity}, Disponibles: ${available}`
        );
      }
    }
  }

  private async validateCancellationTime(booking: any) {
    const now = new Date();
    const activityLine = booking.lines.find((l: any) => l.activityId);

    if (activityLine) {
      const activity = await this.prisma.activity.findUnique({
        where: { id_activity: activityLine.activityId }
      });

      if (activity) {
        const hoursUntilActivity = (new Date(activity.init_date).getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilActivity < 48) {
          throw new BadRequestException(
            'No pots cancelar aquesta reserva. Falten menys de 48h per a l\'activitat. Contacta amb un administrador.'
          );
        }
      }
    } else {
      const hoursUntilStart = (new Date(booking.init_date).getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilStart < 24) {
        throw new BadRequestException(
          'No pots cancelar aquesta reserva. Falten menys de 24h per a l\'inici. Contacta amb un administrador.'
        );
      }
    }
  }

  async remove(id: number) {
    const booking = await this.findOne(id);
    const currentStatus = (booking.status as any).code;

    if (currentStatus === 'IN_PROGRESS') {
      throw new BadRequestException('No es pot eliminar una reserva en curs');
    }

    return this.prisma.booking.delete({ where: { id_booking: id } });
  }
}