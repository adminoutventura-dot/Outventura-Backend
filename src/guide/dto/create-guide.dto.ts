import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateGuideDto {
    @ApiProperty({ description: 'ID de l\'usuari associat', example: 1 })
    @IsInt()
    userId!: number;

    @ApiProperty({ description: 'Credencials del guia', example: 'Llicència federativa núm. 1234' })
    @IsString()
    @IsNotEmpty()
    credentials!: string;

    @ApiPropertyOptional({ example: [1, 2], description: 'IDs de les categories/especialitats del guia' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    categoryIds?: number[];
}