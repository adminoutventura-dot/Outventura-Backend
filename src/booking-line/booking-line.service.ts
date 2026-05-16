import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';

@Injectable()
export class BookingLineService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingLineDto) {
    if (!dto.equipmentId && !dto.activityId) {
      throw new BadRequestException('Cal especificar equipmentId o activityId');
    }
    if (dto.equipmentId && dto.activityId) {
      throw new BadRequestException('Una línia només pot tindre equipment o activitat, no els dos');
    }

    const booking = await this.prisma.booking.findUnique({ where: { id_booking: dto.bookingId } });
    if (!booking) throw new NotFoundException('Reserva no trobada');

    if (dto.equipmentId) {
      const equipment = await this.prisma.equipment.findUnique({ where: { id_equipment: dto.equipmentId } });
      if (!equipment) throw new NotFoundException('Material no trobat');
    }

    if (dto.activityId) {
      const activity = await this.prisma.activity.findUnique({ where: { id_activity: dto.activityId } });
      if (!activity) throw new NotFoundException('Activitat no trobada');
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
      data: { total_price: total._sum.price_at_moment ?? 0 }
    });

    return line;
  }

  async findAll() {
    return this.prisma.bookingLine.findMany({
      include: { equipment: true, activity: true }
    });
  }

  async findOne(id: number) {
    const line = await this.prisma.bookingLine.findUnique({
      where: { id_line: id },
      include: { equipment: true, activity: true }
    });
    if (!line) throw new NotFoundException('Línia de reserva no trobada');
    return line;
  }

  async update(id: number, dto: UpdateBookingLineDto) {
    await this.findOne(id);
    return this.prisma.bookingLine.update({
      where: { id_line: id },
      data: dto,
      include: { equipment: true, activity: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bookingLine.delete({ where: { id_line: id } });
  }
}