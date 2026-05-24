import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBookingStatusDto {
    @ApiProperty({ description: 'Codi de l\'estat', example: 'PENDING' })
    @Matches(/^[A-Z_]+$/, {
        message: 'El codi ha de ser en majúscules, sense espais, números ni caràcters especials'
    })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiPropertyOptional({ description: 'Descripció de l\'estat', example: 'Reserva pendent de confirmació' })
    @IsString()
    @IsOptional()
    description?: string;
}