import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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