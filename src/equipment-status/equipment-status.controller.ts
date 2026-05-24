import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEquipmentStatusDto } from './dto/create-equipment-status.dto';
import { EquipmentStatusService } from './equipment-status.service';

@ApiTags('Equipment Status')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment-status')
export class EquipmentStatusController {
  constructor(private readonly service: EquipmentStatusService) { }

  @Post()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Crear un nou estat per al material' })
  @ApiResponse({ status: 201, description: 'Estat creat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 409, description: 'El codi d\'estat ja existeix.' })
  create(@Body() dto: CreateEquipmentStatusDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar tots els estats de material' })
  @ApiResponse({ status: 200, description: 'Llista d\'estats retornada.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Obtenir un estat per ID' })
  @ApiResponse({ status: 200, description: 'Estat retornat correctament.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar un estat' })
  @ApiResponse({ status: 200, description: 'Estat actualitzat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEquipmentStatusDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un estat' })
  @ApiResponse({ status: 200, description: 'Estat eliminat correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar si té equips associats.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}