import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsInt, IsOptional } from 'class-validator';

export class PromoteGuideDto {
    @ApiProperty({ example: 'Llicència federativa núm. 1234' })
    @IsString()
    @IsNotEmpty()
    credentials!: string;

    @ApiPropertyOptional({ example: [1, 2], description: 'IDs de les categories/especialitats del guia' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    categoryIds?: number[];
}