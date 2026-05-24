import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateBookingLineDto {
    @ApiPropertyOptional({ description: 'Quantitat', example: 2 })
    @IsInt()
    @IsOptional()
    @Min(1)
    quantity?: number;
}