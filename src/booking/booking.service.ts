import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id_user: dto.userId } });
    if (!user) throw new NotFoundException('Usuari no trobat');
    if (!user.status) throw new BadRequestException('L\'usuari està inactiu');

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
      },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: true
      }
    });
  }

  async findAll(filters?: { userId?: number; guideId?: number; date?: string }) {
    return this.prisma.booking.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.date && {
          created_at: {
            gte: new Date(filters.date + 'T00:00:00Z'),
            lte: new Date(filters.date + 'T23:59:59Z'),
          }
        }),
        ...(filters?.guideId && {
          lines: {
            some: {
              activity: { guideId: filters.guideId }
            }
          }
        }),
      },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: {
          include: { equipment: true, activity: true }
        }
      }
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: id },
      include: {
        user: { select: { name: true, email: true } },
        status: true,
        lines: {
          include: { equipment: true, activity: true }
        }
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

    const newStatus = await this.prisma.bookingStatus.findUnique({
      where: { id_book_status: dto.statusId }
    });

    if (!newStatus) {
      throw new NotFoundException('Estat de reserva no trobat');
    }

    const newStatusCode = newStatus.code;
    const currentRole = currentUser.role.code;

    const validTransitions: Record<string, string[]> = {
      'PENDING': ['ACCEPTED', 'CANCELLED'],
      'ACCEPTED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['FINISHED'],
      'FINISHED': [],
      'CANCELLED': [],
    };

    // CANCELLED i FINISHED només SUPER pot canviar-los
    if (['FINISHED', 'CANCELLED'].includes(currentStatus)) {
      if (currentRole !== 'SUPER') {
        throw new ForbiddenException(
          `No es pot canviar l\'estat d\'una reserva ${currentStatus}. Contacta amb un superadministrador.`
        );
      }
    }
    else {
      const allowed = validTransitions[currentStatus] || [];
      if (!allowed.includes(newStatusCode)) {
        throw new BadRequestException(
          `No es pot canviar l\'estat de ${currentStatus} a ${newStatusCode}. Transicions permeses: ${allowed.join(', ')}`
        );
      }
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

  async remove(id: number) {
    const booking = await this.findOne(id);
    const currentStatus = (booking.status as any).code;

    if (currentStatus === 'IN_PROGRESS') {
      throw new BadRequestException('No es pot eliminar una reserva en curs');
    }

    return this.prisma.booking.delete({ where: { id_booking: id } });
  }
}