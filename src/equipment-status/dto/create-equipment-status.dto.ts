// create-equipment-status.dto.ts
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentStatusDto {
    @ApiProperty({
        description: 'Codi únic per a identificar l\'estat del material',
        example: 'AVAILABLE',
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    code!: string;

    @ApiProperty({
        description: 'Explicació detallada de què significa aquest estat',
        example: 'El material està en perfecte estat i llest per a ser llogat',
        required: false,
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;
}