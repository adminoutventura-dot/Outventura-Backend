import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAuthDto {
    @ApiProperty({ example: 'Joan', description: 'Nom de l\'usuari' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'Garcia', description: 'Cognom de l\'usuari' })
    @IsString()
    @IsNotEmpty()
    surname!: string;

    @ApiProperty({ example: 'joan@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'password123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiPropertyOptional({ example: '666123456' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'BEGINNER' })
    @IsString()
    @IsOptional()
    experience_level?: string;
}