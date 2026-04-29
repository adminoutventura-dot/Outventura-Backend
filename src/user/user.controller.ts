import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @Post()
  @ApiOperation({ summary: 'Registrar un nou usuari' })
  @ApiResponse({ status: 201, description: 'Usuari creat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades invàlides o el rol no existeix.' })
  @ApiResponse({ status: 409, description: 'L\'email ja està registrat.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Llistar tots els usuaris' })
  @ApiResponse({ status: 200, description: 'Retorna la llista d\'usuaris amb els seus rols.' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un usuari per ID' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari' })
  @ApiResponse({ status: 200, description: 'Usuari trobat.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualitzar les dades d\'un usuari' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a editar' })
  @ApiResponse({ status: 200, description: 'Usuari actualitzat correctament.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  @ApiResponse({ status: 409, description: 'El nou email ja està en ús.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuari' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a esborrar' })
  @ApiResponse({ status: 200, description: 'Usuari eliminat correctament.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}