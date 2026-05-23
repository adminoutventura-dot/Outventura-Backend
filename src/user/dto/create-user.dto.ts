import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'User', description: 'Nom de l\'usuari' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'Test', description: 'Cognoms de l\'usuari' })
    @IsString()
    @IsNotEmpty()
    surname!: string;

    @ApiProperty({ example: 'user.test@exemple.com', description: 'Correu electrònic únic' })
    @IsEmail({}, { message: 'El correu electrònic no és vàlid' })
    email!: string;

    @ApiProperty({ example: '12345678', description: 'Contrasenya (mínim 8 caràcters)', format: 'password' })
    @IsString()
    @MinLength(8, { message: 'La contrasenya ha de tenir almenys 8 caràcters' })
    password!: string;

    @ApiProperty({ example: 3, description: 'ID del rol assignat (ha d\'existir a la taula Role)' })
    @IsInt()
    roleId!: number;

    @ApiPropertyOptional({ example: '600123456' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://foto.com/perfil.jpg' })
    @IsString()
    @IsOptional()
    photo?: string;

    @ApiPropertyOptional({ example: true, description: 'Estat de l\'usuari' })
    @IsBoolean()
    @IsOptional()
    status?: boolean;
}