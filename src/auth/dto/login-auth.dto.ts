import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({ example: 'usuari@email.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: '12345678' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;
}