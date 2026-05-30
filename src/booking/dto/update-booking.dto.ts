import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateBookingDto {
    @ApiPropertyOptional({ description: 'ID de l\'usuari que canvia', example: 1 })
    @IsInt()
    @IsOptional()
    userId?: number;

    @ApiPropertyOptional({ description: 'Nova data d\'inici de la reserva', example: '2026-06-15T09:00:00Z' })
    @IsDateString()
    @IsOptional()
    init_date?: string;

    @ApiPropertyOptional({ description: 'Nova data de fi de la reserva', example: '2026-06-20T09:00:00Z' })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiPropertyOptional({ description: 'Nou estat de la reserva', example: 2 })
    @IsInt()
    @IsOptional()
    statusId?: number;

    @ApiPropertyOptional({ description: 'Línies de reserva (s\'ignoraran en aquesta actualització)', type: [Object] })
    @IsArray()
    @IsOptional()
    lines?: any[];
}