import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ description: 'ID de l\'usuari que fa la reserva', example: 1 })
    @IsInt()
    @IsNotEmpty()
    userId!: number;
}