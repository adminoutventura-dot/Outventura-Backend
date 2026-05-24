import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingLineDto {
    @ApiProperty({ description: 'ID de la reserva', example: 1 })
    @IsInt()
    bookingId!: number;

    @ApiProperty({ description: 'Preu en el moment de la reserva', example: 25.99 })
    @IsNumber()
    price_at_moment!: number;

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