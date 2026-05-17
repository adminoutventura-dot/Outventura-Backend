import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Crear un nou usuari (gestió interna)' })
  @ApiResponse({ status: 201, description: 'Usuari creat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades invàlides o el rol no existeix.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 409, description: 'L\'email ja està registrat.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar tots els usuaris' })
  @ApiResponse({ status: 200, description: 'Retorna la llista d\'usuaris amb els seus rols.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Obtenir un usuari per ID' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari' })
  @ApiResponse({ status: 200, description: 'Usuari trobat.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar les dades d\'un usuari' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a editar' })
  @ApiResponse({ status: 200, description: 'Usuari actualitzat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  @ApiResponse({ status: 409, description: 'El nou email ja està en ús.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un usuari' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a esborrar' })
  @ApiResponse({ status: 200, description: 'Usuari eliminat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}