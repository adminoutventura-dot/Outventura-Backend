import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BookingLineController } from './booking-line.controller';
import { BookingLineService } from './booking-line.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookingLineController],
  providers: [BookingLineService],
})
export class BookingLineModule { }
