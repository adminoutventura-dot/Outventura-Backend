// guide.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GuideService } from './guide.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Guides')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) { }

  @Post()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Assigna un usuari com a guia' })
  @ApiResponse({ status: 201, description: 'Guia creat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  @ApiResponse({ status: 409, description: 'Aquest usuari ja és guia.' })
  create(@Body() createGuideDto: CreateGuideDto) {
    return this.guideService.create(createGuideDto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Llistar tots els guies' })
  @ApiResponse({ status: 200, description: 'Llista de guies retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  findAll() {
    return this.guideService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir un guia per ID' })
  @ApiResponse({ status: 200, description: 'Guia retornat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Guia no trobat.' })
  findOne(@Param('id') id: string) {
    return this.guideService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Actualitzar un guia' })
  @ApiResponse({ status: 200, description: 'Guia actualitzat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Guia no trobat.' })
  update(@Param('id') id: string, @Body() updateGuideDto: UpdateGuideDto) {
    return this.guideService.update(+id, updateGuideDto);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un guia' })
  @ApiResponse({ status: 200, description: 'Guia eliminat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Guia no trobat.' })
  remove(@Param('id') id: string) {
    return this.guideService.remove(+id);
  }
}