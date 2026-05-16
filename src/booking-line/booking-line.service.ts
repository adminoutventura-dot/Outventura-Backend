import { Injectable } from '@nestjs/common';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';

@Injectable()
export class BookingLineService {
  create(createBookingLineDto: CreateBookingLineDto) {
    return 'This action adds a new bookingLine';
  }

  findAll() {
    return `This action returns all bookingLine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingLine`;
  }

  update(id: number, updateBookingLineDto: UpdateBookingLineDto) {
    return `This action updates a #${id} bookingLine`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingLine`;
  }
}
