import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        example: 'TEST',
        description: 'Codi únic per al rol (ex: SUPER, ADMIN, USER, GUEST)'
    })
    @Matches(/^[A-Z_]+$/, {
        message: 'El codi ha de ser en majúscules, sense espais, números ni caràcters especials'
    })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiPropertyOptional({
        example: 'Test role',
        description: 'Breu descripció de les funcions del rol'
    })
    @IsString()
    @IsOptional()
    description?: string;
}