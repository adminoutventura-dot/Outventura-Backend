import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EquipmentStatusService } from './equipment-status.service';
import { CreateEquipmentStatusDto } from './dto/create-equipment-status.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Equipment Status')
@Controller('equipment-status')
export class EquipmentStatusController {
  constructor(private readonly service: EquipmentStatusService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nou estat per al material' })
  @ApiResponse({ status: 201, description: 'Estat creat correctament.' })
  @ApiResponse({ status: 409, description: 'El codi d\'estat ja existeix.' })
  create(@Body() dto: CreateEquipmentStatusDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Llistar tots els estats de material' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un estat per ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualitzar un estat' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEquipmentStatusDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estat' })
  @ApiResponse({ status: 200, description: 'Estat eliminat correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar si té equips associats.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}