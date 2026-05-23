import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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