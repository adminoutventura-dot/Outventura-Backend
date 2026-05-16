import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsDateString, IsOptional } from 'class-validator';

export class CreateActivityDto {
    @ApiProperty({ example: 'Ruta de les Fonts', description: 'Títol de l\'activitat' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({ example: 'Ruta guiada per les fonts naturals del riu.', required: false })
    @IsString()
    @IsOptional()
    description?: string;

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

    @ApiProperty({ example: 'Plaça de l’Ajuntament', required: false })
    @IsString()
    @IsOptional()
    start_end_point?: string;

    @ApiProperty({ example: 1, description: 'ID del guia assignat' })
    @IsInt()
    guideId!: number;
}