import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsArray } from 'class-validator';

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

    @ApiPropertyOptional({
        description: 'Imatge o URL de la imatge del material',
        example: 'assets/images/trek_fuel.jpg'
    })
    @IsString()
    @IsOptional()
    image_asset?: string;

    @ApiProperty({
        description: 'Preu de lloguer per dia',
        example: 25.50
    })
    @IsNumber()
    @Min(0)
    price_per_day!: number;

    @ApiProperty({
        description: 'Fiança o penalització per danys',
        example: 150.00
    })
    @IsNumber()
    @Min(0)
    damage_fee!: number;

    @ApiProperty({
        description: 'Unitats totals en el magatzem físic',
        example: 10,
        default: 1
    })
    @IsInt()
    @Min(1)
    total_units!: number;

    @ApiProperty({
        description: 'ID de l\'estat del material',
        example: 1
    })
    @IsInt()
    @IsNotEmpty()
    statusId!: number;

    @ApiPropertyOptional({ example: ['MOUNTAIN', 'CAMPING'], description: 'Codis de les categories a assignar' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    categoryCodes?: string[];
}