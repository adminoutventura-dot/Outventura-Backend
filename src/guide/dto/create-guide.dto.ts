import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateGuideDto {
    @ApiProperty({ description: 'ID de l\'usuari associat', example: 1 })
    @IsInt()
    userId!: number;

    @ApiProperty({ description: 'Especialitat del guia', example: 'Senderisme' })
    @IsString()
    @IsNotEmpty()
    specialty!: string;

    @ApiProperty({ description: 'Credencials del guia', example: 'Llicència federativa núm. 1234' })
    @IsString()
    @IsNotEmpty()
    credentials!: string;
}