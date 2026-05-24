import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingController } from './booking.controller';
import { BookingScheduler } from './booking.scheduler';
import { BookingService } from './booking.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [BookingService, BookingScheduler],
})
export class BookingModule { }
