import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class UpdateGuideDto {
    @ApiPropertyOptional({ description: 'Credencials del guia', example: 'Llicència núm. 5678' })
    @IsString()
    @IsOptional()
    credentials?: string;

    @ApiPropertyOptional({ example: [1, 2], description: 'IDs de les categories a establir' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    categoryIds?: number[];
}