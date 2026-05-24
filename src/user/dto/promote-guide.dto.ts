import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PromoteGuideDto {
    @ApiProperty({ example: 'Senderisme', description: 'Especialitat del guia' })
    @IsString()
    @IsNotEmpty()
    specialty!: string;

    @ApiProperty({ example: 'Llicència federativa núm. 1234' })
    @IsString()
    @IsNotEmpty()
    credentials!: string;
}