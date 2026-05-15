import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Roles (for User Management)')
@ApiBearerAuth('JWT-auth')   // Swagger mostra el cadenat 🔒
@UseGuards(JwtAuthGuard, RolesGuard)  // Protecció real
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @Roles('SUPER')
  @ApiOperation({ summary: 'Crea un nou rol d\'usuari' })
  @ApiResponse({ status: 201, description: 'Rol creat correctament.', type: CreateRoleDto })
  @ApiResponse({ status: 400, description: 'Dades enviades incorrectes (Validació).' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 409, description: 'Conflicte: El codi del rol ja existeix.' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar tots els rols' })
  @ApiResponse({ status: 200, description: 'Retorna una llista de rols.', type: [CreateRoleDto] })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Obtenir un rol per ID' })
  @ApiResponse({ status: 200, description: 'Retorna el rol demanat.', type: CreateRoleDto })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar un rol' })
  @ApiResponse({ status: 200, description: 'Rol actualitzat correctament.', type: CreateRoleDto })
  @ApiResponse({ status: 400, description: 'Dades enviades incorrectes (Validació).' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  @ApiResponse({ status: 409, description: 'Conflicte: El codi ja està en ús per un altre rol.' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminat correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar un rol amb usuaris assignats.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  async remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
