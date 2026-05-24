import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingStatusController } from './booking-status.controller';
import { BookingStatusService } from './booking-status.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingStatusController],
  providers: [BookingStatusService],
})
export class BookingStatusModule { }