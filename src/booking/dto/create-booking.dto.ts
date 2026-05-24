import { IsInt, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ description: 'ID de l\'usuari que fa la reserva', example: 1 })
    @IsInt()
    @IsNotEmpty()
    userId!: number;

    @ApiProperty({ description: 'Data d\'inici de la reserva', example: '2026-06-15T09:00:00Z' })
    @IsDateString()
    init_date!: string;

    @ApiProperty({ description: 'Data de fi de la reserva', example: '2026-06-20T09:00:00Z' })
    @IsDateString()
    end_date!: string;
}