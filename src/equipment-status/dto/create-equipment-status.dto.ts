import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateEquipmentStatusDto {
    @ApiProperty({
        description: 'Codi únic per a identificar l\'estat del material',
        example: 'AVAILABLE',
        maxLength: 20,
    })
    @Matches(/^[A-Z_]+$/, {
        message: 'El codi ha de ser en majúscules, sense espais, números ni caràcters especials'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    code!: string;

    @ApiPropertyOptional({
        description: 'Explicació detallada de què significa aquest estat',
        example: 'El material està en perfecte estat i llest per a ser llogat',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    description?: string;
}