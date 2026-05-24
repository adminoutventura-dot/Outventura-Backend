import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGuideDto {
    @ApiPropertyOptional({ description: 'Especialitat del guia', example: 'Muntanya' })
    @IsString()
    @IsOptional()
    specialty?: string;

    @ApiPropertyOptional({ description: 'Credencials del guia', example: 'Llicència núm. 5678' })
    @IsString()
    @IsOptional()
    credentials?: string;
}