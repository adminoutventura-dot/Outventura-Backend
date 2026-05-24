import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { PromoteGuideDto } from './dto/promote-guide.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

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

  @Get('active')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar usuaris actius' })
  @ApiResponse({ status: 200, description: 'Llista d\'usuaris actius retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  async findAllActive() {
    return this.userService.findAllActive();
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
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Actualitzar les dades d\'un usuari' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a editar' })
  @ApiResponse({ status: 200, description: 'Usuari actualitzat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  @ApiResponse({ status: 409, description: 'El nou email ja està en ús.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: any) {
    return this.userService.update(id, updateUserDto, currentUser);
  }

  @Patch(':id/promote/guide')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Promocionar un usuari a GUIDE' })
  @ApiParam({ name: 'id', description: 'ID de l\'usuari a promocionar' })
  @ApiResponse({ status: 200, description: 'Usuari promocionat a GUIDE correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  @ApiResponse({ status: 409, description: 'L\'usuari ja és guia.' })
  async promoteToGuide(@Param('id', ParseIntPipe) id: number, @Body() dto: PromoteGuideDto) {
    return this.userService.promoteToGuide(id, dto.specialty, dto.credentials);
  }

  @Patch(':id/promote/admin')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Promocionar un usuari a ADMIN' })
  @ApiParam({ name: 'id', description: 'ID de l\'usuari a promocionar' })
  @ApiResponse({ status: 200, description: 'Usuari promocionat a ADMIN correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot canviar el rol d\'un SUPER.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async promoteToAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.userService.promoteToAdmin(id);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un usuari (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID numèric de l\'usuari a esborrar' })
  @ApiResponse({ status: 200, description: 'Usuari eliminat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    return this.userService.remove(id, currentUser);
  }
}