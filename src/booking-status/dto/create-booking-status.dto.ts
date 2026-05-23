import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingStatusDto {
    @ApiProperty({ description: 'Codi de l\'estat', example: 'PENDING' })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiPropertyOptional({ description: 'Descripció de l\'estat', example: 'Reserva pendent de confirmació' })
    @IsString()
    @IsOptional()
    description?: string;
}