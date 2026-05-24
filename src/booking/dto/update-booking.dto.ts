import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateBookingDto {
    @ApiPropertyOptional({ description: 'Nou estat de la reserva', example: 2 })
    @IsInt()
    @IsOptional()
    statusId?: number;
}