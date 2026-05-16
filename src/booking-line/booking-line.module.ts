import { Module } from '@nestjs/common';
import { BookingLineService } from './booking-line.service';
import { BookingLineController } from './booking-line.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingLineController],
  providers: [BookingLineService],
})
export class BookingLineModule { }
