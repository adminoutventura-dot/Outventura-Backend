import { PartialType } from '@nestjs/swagger';
import { CreateBookingLineDto } from './create-booking-line.dto';

export class UpdateBookingLineDto extends PartialType(CreateBookingLineDto) {}
