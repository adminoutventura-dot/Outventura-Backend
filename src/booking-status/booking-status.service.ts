import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingStatusDto } from './dto/create-booking-status.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingStatusService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBookingStatusDto) {
    const existing = await this.prisma.bookingStatus.findUnique({
      where: { code: dto.code }
    });
    if (existing) throw new ConflictException('Aquest codi d\'estat ja existeix');

    return this.prisma.bookingStatus.create({ data: dto });
  }

  async findAll() {
    return this.prisma.bookingStatus.findMany();
  }

  async findOne(id: number) {
    const status = await this.prisma.bookingStatus.findUnique({
      where: { id_book_status: id }
    });
    if (!status) throw new NotFoundException('Estat de reserva no trobat');
    return status;
  }

  async update(id: number, dto: UpdateBookingStatusDto) {
    await this.findOne(id);
    return this.prisma.bookingStatus.update({
      where: { id_book_status: id },
      data: dto
    });
  }

  async remove(id: number) {
    const status = await this.prisma.bookingStatus.findUnique({
      where: { id_book_status: id },
      include: { _count: { select: { bookings: true } } }
    });
    if (!status) throw new NotFoundException('Estat de reserva no trobat');

    if (status._count.bookings > 0) {
      throw new BadRequestException(
        `No es pot eliminar l'estat perquè té ${status._count.bookings} reserva(es) assignada(es)`
      );
    }

    return this.prisma.bookingStatus.delete({ where: { id_book_status: id } });
  }
}