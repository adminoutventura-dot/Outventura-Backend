import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingLineDto {
    @ApiPropertyOptional({ description: 'Quantitat', example: 2 })
    @IsInt()
    @IsOptional()
    @Min(1)
    quantity?: number;
}