import { Module } from '@nestjs/common';
import { BookingStatusService } from './booking-status.service';
import { BookingStatusController } from './booking-status.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingStatusController],
  providers: [BookingStatusService],
})
export class BookingStatusModule { }