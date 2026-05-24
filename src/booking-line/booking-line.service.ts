import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';

@Injectable()
export class BookingLineService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingLineDto, currentUser: any) {
    if (!dto.equipmentId && !dto.activityId) {
      throw new BadRequestException('Cal especificar equipmentId o activityId');
    }

    if (dto.equipmentId && dto.activityId) {
      throw new BadRequestException('Una línia només pot tindre equipment o activitat, no els dos');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: dto.bookingId },
      include: { status: true, lines: { include: { activity: true } } }
    });

    if (!booking) {
      throw new NotFoundException('Reserva no trobada');
    }

    if (!currentUser.status) {
      throw new BadRequestException(
        'El teu perfil està inactiu temporalment. Contacta amb un administrador.'
      );
    }

    const blockedStatuses = ['CANCELLED', 'FINISHED', 'IN_PROGRESS'];
    if (blockedStatuses.includes((booking.status as any).code)) {
      throw new BadRequestException(
        `No es poden afegir línies a una reserva en estat ${(booking.status as any).code}`
      );
    }

    if (dto.activityId) {
      const existingActivity = (booking.lines as any[]).find(l => l.activityId);
      if (existingActivity) {
        throw new BadRequestException(
          'Una reserva només pot contenir una activitat. Crea una nova reserva per a una altra activitat.'
        );
      }

      const activity = await this.prisma.activity.findUnique({
        where: { id_activity: dto.activityId },
        include: { guide: { include: { user: true } } }
      });

      if (!activity) {
        throw new NotFoundException('Activitat no trobada');
      }

      if (!(activity.guide as any).user.status) {
        throw new BadRequestException('El guia de l\'activitat està inactiu');
      }

      const now = new Date();
      const hoursUntilActivity = (new Date(activity.init_date).getTime() - now.getTime()) / (1000 * 60 * 60);
      const daysUntilActivity = hoursUntilActivity / 24;
      const currentRole = currentUser.role.code;

      if (currentRole === 'GUIDE') {
        const guideProfile = await this.prisma.guide.findUnique({
          where: { userId: currentUser.id_user }
        });

        if (guideProfile && activity.guideId === guideProfile.id_guide) {
          // És la seva activitat → no pot reservar per a ell mateix
          if ((booking as any).userId === currentUser.id_user) {
            throw new ForbiddenException('No pots reservar una activitat de la qual ets el guia');
          }
          // Pot apuntar altres usuaris si falten > 3 dies
          if (daysUntilActivity < 3) {
            throw new BadRequestException(
              'No pots apuntar usuaris a la teva activitat. Falten menys de 3 dies. Consulta amb un administrador.'
            );
          }
          // Comprova duplicat per a l'usuari de la reserva
          const duplicateForUser = await this.prisma.bookingLine.findFirst({
            where: {
              activityId: dto.activityId,
              booking: {
                userId: (booking as any).userId,
                status: { code: { in: ['PENDING', 'ACCEPTED'] } }
              }
            }
          });

          if (duplicateForUser) {
            throw new BadRequestException(
              `L\'usuari ja té una reserva activa per a aquesta activitat (reserva #${duplicateForUser.bookingId}).`
            );
          }
          // Comprova conflicte de dates per a l'usuari de la reserva
          const conflictForUser = await this.prisma.bookingLine.findFirst({
            where: {
              activityId: { not: dto.activityId },
              activity: { isNot: null },
              booking: {
                userId: (booking as any).userId,
                status: { code: { in: ['PENDING', 'ACCEPTED'] } },
                AND: [
                  { init_date: { lte: activity.end_date } },
                  { end_date: { gte: activity.init_date } }
                ]
              }
            },
            include: { booking: true }
          });

          if (conflictForUser) {
            throw new BadRequestException(
              `L\'usuari ja té una altra activitat reservada per a aquestes dates (reserva #${conflictForUser.bookingId}).`
            );
          }
        }
        else {
          // No és la seva activitat → restriccions normals de GUIDE
          if (daysUntilActivity < 3) {
            throw new BadRequestException(
              'No es pot reservar aquesta activitat. Falten menys de 3 dies. Contacta amb un administrador.'
            );
          }
        }
      }

      if (currentRole === 'USER') {
        if (daysUntilActivity < 3) {
          throw new BadRequestException(
            'No es pot reservar aquesta activitat. Falten menys de 3 dies. Contacta amb un administrador.'
          );
        }
      }

      if (['ADMIN', 'SUPER'].includes(currentRole)) {
        if (hoursUntilActivity < 12) {
          throw new BadRequestException(
            'No es pot reservar aquesta activitat. Falten menys de 12h per a l\'inici.'
          );
        }
      }

      const existingParticipants = await this.prisma.bookingLine.count({
        where: {
          activityId: dto.activityId,
          booking: { status: { code: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }
        }
      });

      if (existingParticipants >= activity.max_participants) {
        throw new BadRequestException(
          `L\'activitat ha assolit l\'aforament màxim de ${activity.max_participants} participants`
        );
      }

      const duplicateBooking = await this.prisma.bookingLine.findFirst({
        where: {
          activityId: dto.activityId,
          booking: {
            userId: (booking as any).userId,
            status: { code: { in: ['PENDING', 'ACCEPTED'] } }
          }
        }
      });

      if (duplicateBooking) {
        throw new BadRequestException(
          `Ja tens una reserva activa per a aquesta activitat (reserva #${duplicateBooking.bookingId}). ` +
          `Si vols modificar-la, accedeix a la reserva existent.`
        );
      }

      const conflictingActivity = await this.prisma.bookingLine.findFirst({
        where: {
          activityId: { not: dto.activityId },
          activity: { isNot: null },
          booking: {
            userId: (booking as any).userId,
            status: { code: { in: ['PENDING', 'ACCEPTED'] } },
            AND: [
              { init_date: { lte: activity.end_date } },
              { end_date: { gte: activity.init_date } }
            ]
          }
        },
        include: { booking: true }
      });

      if (conflictingActivity) {
        throw new BadRequestException(
          `Ja tens una altra activitat reservada per a aquestes dates (reserva #${conflictingActivity.bookingId}).`
        );
      }

      await this.prisma.booking.update({
        where: { id_booking: dto.bookingId },
        data: {
          init_date: activity.init_date,
          end_date: activity.end_date,
        }
      });
    }

    if (dto.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({
        where: { id_equipment: dto.equipmentId },
        include: { status: true }
      });

      if (!equipment) {
        throw new NotFoundException('Material no trobat');
      }

      if ((equipment.status as any).code !== 'AVAILABLE') {
        throw new BadRequestException(
          `El material "${equipment.title}" no està disponible per a reservar`
        );
      }

      const now = new Date();
      const hoursUntilStart = (new Date((booking as any).init_date).getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilStart < 48) {
        throw new BadRequestException(
          'Les reserves de material s\'han de fer amb un mínim de 48h d\'antelació'
        );
      }

      if (dto.quantity > equipment.units) {
        throw new BadRequestException(
          `No hi ha suficients unitats disponibles. Unitats en stock: ${equipment.units}`
        );
      }
    }

    const line = await this.prisma.bookingLine.create({
      data: {
        booking: { connect: { id_booking: dto.bookingId } },
        quantity: dto.quantity,
        price_at_moment: dto.price_at_moment,
        ...(dto.equipmentId && { equipment: { connect: { id_equipment: dto.equipmentId } } }),
        ...(dto.activityId && { activity: { connect: { id_activity: dto.activityId } } }),
      },
      include: { equipment: true, activity: true }
    });

    const total = await this.prisma.bookingLine.aggregate({
      where: { bookingId: dto.bookingId },
      _sum: { price_at_moment: true }
    });

    await this.prisma.booking.update({
      where: { id_booking: dto.bookingId },
      data: { total_price: total._sum?.price_at_moment ?? 0 }
    });

    return line;
  }

  async findAll(bookingId?: number) {
    return this.prisma.bookingLine.findMany({
      where: { ...(bookingId && { bookingId }) },
      include: { equipment: true, activity: true }
    });
  }

  async findOne(id: number) {
    const line = await this.prisma.bookingLine.findUnique({
      where: { id_line: id },
      include: { equipment: true, activity: true }
    });

    if (!line) {
      throw new NotFoundException('Línia de reserva no trobada');
    }

    return line;
  }

  async update(id: number, dto: UpdateBookingLineDto, currentUser: any) {
    const line = await this.findOne(id);

    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: line.bookingId },
      include: { status: true }
    });

    const statusCode = (booking?.status as any).code;

    if (['IN_PROGRESS', 'FINISHED', 'CANCELLED'].includes(statusCode)) {
      throw new BadRequestException(
        `No es pot modificar una línia d\'una reserva en estat ${statusCode}`
      );
    }

    if (dto.quantity && line.equipmentId) {
      const now = new Date();
      const hoursUntilStart = (new Date((booking as any).init_date).getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilStart < 24) {
        throw new BadRequestException(
          'No es pot modificar la quantitat. Falten menys de 24h per a l\'inici de la reserva.'
        );
      }

      const equipment = await this.prisma.equipment.findUnique({
        where: { id_equipment: line.equipmentId }
      });

      if (equipment && dto.quantity > equipment.units) {
        throw new BadRequestException(
          `No hi ha suficients unitats disponibles. Unitats en stock: ${equipment.units}`
        );
      }
    }

    const updated = await this.prisma.bookingLine.update({
      where: { id_line: id },
      data: dto,
      include: { equipment: true, activity: true }
    });

    const total = await this.prisma.bookingLine.aggregate({
      where: { bookingId: updated.bookingId },
      _sum: { price_at_moment: true }
    });

    await this.prisma.booking.update({
      where: { id_booking: updated.bookingId },
      data: { total_price: total._sum?.price_at_moment ?? 0 }
    });

    return updated;
  }

  async remove(id: number, currentUser: any) {
    const line = await this.findOne(id);
    const currentRole = currentUser.role.code;

    if (['GUIDE', 'USER'].includes(currentRole)) {
      throw new ForbiddenException(
        'No tens permisos per eliminar línies de reserva. ' +
        'Pots cancelar la reserva si compleix les restriccions de temps.'
      );
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: line.bookingId },
      include: { status: true }
    });

    const statusCode = (booking?.status as any).code;

    if (['IN_PROGRESS', 'FINISHED'].includes(statusCode)) {
      throw new BadRequestException(
        `No es pot eliminar una línia d\'una reserva en estat ${statusCode}`
      );
    }

    await this.prisma.bookingLine.delete({ where: { id_line: id } });

    const total = await this.prisma.bookingLine.aggregate({
      where: { bookingId: line.bookingId },
      _sum: { price_at_moment: true }
    });

    await this.prisma.booking.update({
      where: { id_booking: line.bookingId },
      data: { total_price: total._sum?.price_at_moment ?? 0 }
    });

    return { message: 'Línia de reserva eliminada correctament' };
  }
}