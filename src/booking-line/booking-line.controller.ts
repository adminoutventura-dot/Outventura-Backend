import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingLineService } from './booking-line.service';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';

@Controller('booking-line')
export class BookingLineController {
  constructor(private readonly bookingLineService: BookingLineService) {}

  @Post()
  create(@Body() createBookingLineDto: CreateBookingLineDto) {
    return this.bookingLineService.create(createBookingLineDto);
  }

  @Get()
  findAll() {
    return this.bookingLineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingLineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingLineDto: UpdateBookingLineDto) {
    return this.bookingLineService.update(+id, updateBookingLineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingLineService.remove(+id);
  }
}
