import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateBookingLineDto {
    @ApiProperty({ description: 'ID de la reserva', example: 1 })
    @IsInt()
    bookingId!: number;

    @ApiProperty({ description: 'Quantitat', example: 1 })
    @IsInt()
    @Min(1)
    quantity!: number;

    @ApiPropertyOptional({ description: 'ID del material (si s\'aplica)', example: 1 })
    @IsInt()
    @IsOptional()
    equipmentId?: number;

    @ApiPropertyOptional({ description: 'ID de l\'activitat (si s\'aplica)', example: 1 })
    @IsInt()
    @IsOptional()
    activityId?: number;
}