import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'TEST',
        description: 'Codi únic per al rol (ex: SUPER, ADMIN, USER, GUEST)'
    })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiProperty({
        required: false,
        example: 'Test role',
        description: 'Breu descripció de les funcions del rol'
    })
    @IsString()
    @IsOptional()
    description?: string;
}