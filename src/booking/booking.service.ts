import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingDto) {
    const user = await this.prisma.user.findUnique({ where: { id_user: dto.userId } });
    if (!user) throw new NotFoundException('Usuari no trobat');

    const status = await this.prisma.bookingStatus.findUnique({ where: { id_book_status: dto.statusId } });
    if (!status) throw new NotFoundException('Estat de reserva no trobat');

    return this.prisma.booking.create({
      data: {
        user: { connect: { id_user: dto.userId } },
        status: { connect: { id_book_status: dto.statusId } },
        total_price: 0,
      },
      include: { user: { select: { name: true, email: true } }, status: true, lines: true }
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: { user: { select: { name: true, email: true } }, status: true, lines: true }
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id_booking: id },
      include: { user: { select: { name: true, email: true } }, status: true, lines: true }
    });
    if (!booking) throw new NotFoundException('Reserva no trobada');
    return booking;
  }

  async update(id: number, dto: UpdateBookingDto) {
    await this.findOne(id);
    const status = await this.prisma.bookingStatus.findUnique({ where: { id_book_status: dto.statusId } });
    if (!status) throw new NotFoundException('Estat de reserva no trobat');

    return this.prisma.booking.update({
      where: { id_booking: id },
      data: { status: { connect: { id_book_status: dto.statusId } } },
      include: { user: { select: { name: true, email: true } }, status: true, lines: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.booking.delete({ where: { id_booking: id } });
  }
}