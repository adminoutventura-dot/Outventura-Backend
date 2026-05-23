import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'Codi únic de la categoria',
        example: 'MOUNTAIN',
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code!: string;

    @ApiPropertyOptional({
        description: 'Descripció detallada del tipus d\'activitats o material',
        example: 'Related to mountain activities and equipment',
    })
    @IsString()
    @IsOptional()
    description?: string;
}