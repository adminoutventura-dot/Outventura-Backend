import { Module } from '@nestjs/common';
import { BookingLineService } from './booking-line.service';
import { BookingLineController } from './booking-line.controller';

@Module({
  controllers: [BookingLineController],
  providers: [BookingLineService],
})
export class BookingLineModule {}
