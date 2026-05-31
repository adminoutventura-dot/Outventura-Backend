import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({ example: 'usuari@email.com' })
    @IsEmail({}, { message: 'Introdueix un correu electrònic vàlid' })
    email!: string;

    @ApiProperty({ example: '12345678' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La contrasenya ha de tenir mínim 8 caràcters' })
    password!: string;
}