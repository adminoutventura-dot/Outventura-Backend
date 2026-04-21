import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN' })
    @IsString()
    @IsNotEmpty()
    code!: string;

    @ApiProperty({ required: false, example: 'Administrator role' })
    @IsString()
    @IsOptional()
    description?: string;
}