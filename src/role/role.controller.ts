import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Roles (for User Management)')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ApiOperation({ summary: 'Crea un nou rol d\'usuari' })
  @ApiResponse({ status: 201, description: 'Rol creat correctament.', type: CreateRoleDto })
  @ApiResponse({ status: 400, description: 'Dades enviades incorrectes (Validació).' })
  @ApiResponse({ status: 409, description: 'Conflicte: El codi del rol ja existeix.' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Llistar tots els rols' })
  @ApiResponse({ status: 200, description: 'Retorna una llista de rols.', type: [CreateRoleDto] })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un rol per ID' })
  @ApiResponse({ status: 200, description: 'Retorna el rol demanat.', type: CreateRoleDto })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualitzar un rol' })
  @ApiResponse({ status: 200, description: 'Rol actualitzat correctament.', type: CreateRoleDto })
  @ApiResponse({ status: 400, description: 'Dades enviades incorrectes (Validació).' })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  @ApiResponse({ status: 409, description: 'Conflicte: El codi ja està en ús per un altre rol.' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminat correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar un rol amb usuaris assignats.' })
  @ApiResponse({ status: 404, description: 'Rol no trobat.' })
  async remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
