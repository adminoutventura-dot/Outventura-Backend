import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEquipmentDto {
    @ApiProperty({
        description: 'Títol o nom del material',
        example: 'Bicicleta de muntanya Trek Fuel EX'
    })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiPropertyOptional({
        description: 'Descripció detallada del material',
        example: 'Talla L, frens de disc hidràulics'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Preu de lloguer per dia',
        example: 25.50
    })
    @IsNumber()
    @Min(0)
    price_per_day!: number;

    @ApiProperty({
        description: 'Unitats totals disponibles en stock',
        example: 10,
        default: 1
    })
    @IsInt()
    @Min(1)
    units!: number;

    @ApiProperty({
        description: 'ID de l\'estat del material',
        example: 1
    })
    @IsInt()
    @IsNotEmpty()
    statusId!: number;
}