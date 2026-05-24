import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
    @ApiPropertyOptional({ description: 'Codi de l\'estat', example: 'ACCEPTED' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ description: 'Descripció de l\'estat' })
    @IsString()
    @IsOptional()
    description?: string;
}