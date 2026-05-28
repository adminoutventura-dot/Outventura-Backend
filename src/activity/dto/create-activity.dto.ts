import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateActivityDto {
    @ApiProperty({ example: 'Ruta de les Fonts', description: 'Títol de l\'activitat' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiPropertyOptional({ example: 'Ruta guiada per les fonts naturals del riu.' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'assets/images/ruta.jpg', description: 'Imatge o URL de l\'activitat' })
    @IsString()
    @IsOptional()
    image_asset?: string;

    @ApiProperty({ example: '2024-06-15T09:00:00Z' })
    @IsDateString()
    init_date!: string;

    @ApiProperty({ example: '2024-06-15T14:00:00Z' })
    @IsDateString()
    end_date!: string;

    @ApiProperty({ example: 45, description: 'Percentatge de dificultat (0-100)' })
    @IsInt()
    @Min(0)
    @Max(100)
    difficulty!: number;

    @ApiProperty({ example: 15 })
    @IsInt()
    @Min(1)
    max_participants!: number;

    @ApiPropertyOptional({ example: 'Plaça de l\'Ajuntament' })
    @IsString()
    @IsOptional()
    start_end_point?: string;

    @ApiProperty({ example: 1, description: 'ID del guia assignat' })
    @IsInt()
    guideId!: number;

    @ApiPropertyOptional({ example: [1, 2, 5], description: 'IDs dels materials recomanats' })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    recommendedEquipmentIds?: number[];

    @ApiPropertyOptional({ example: ['MOUNTAIN', 'CAMPING'], description: 'Codis de les categories a assignar' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    categoryCodes?: string[];
}