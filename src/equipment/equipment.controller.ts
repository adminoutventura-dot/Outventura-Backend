import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsInt } from 'class-validator';

class ChangeStatusDto {
  @ApiProperty({ example: 2, description: 'ID del nou estat' })
  @IsInt()
  statusId!: number;
}

@ApiTags('Equipment')
@ApiBearerAuth('JWT-auth')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Registrar nou material en el catàleg' })
  @ApiResponse({ status: 201, description: 'Material creat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Estat de material no trobat.' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Post(':id/category/:catId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Assignar una categoria a un material' })
  @ApiResponse({ status: 200, description: 'Categoria assignada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Material o categoria no trobat.' })
  addCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('catId', ParseIntPipe) catId: number
  ) {
    return this.equipmentService.addCategoryToEquipment(id, catId);
  }

  @Get()
  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER', 'GUEST')
  @ApiOperation({ summary: 'Llistar tot el material amb filtres opcionals' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Filtrar per categoria' })
  @ApiQuery({ name: 'statusId', required: false, type: Number, description: 'Filtrar per estat' })
  @ApiResponse({ status: 200, description: 'Llista de material retornada.' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('statusId') statusId?: string,
    @CurrentUser() currentUser?: any
  ) {
    return this.equipmentService.findAll(
      {
        categoryId: categoryId ? +categoryId : undefined,
        statusId: statusId ? +statusId : undefined,
      },
      currentUser?.role?.code
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER', 'GUEST')
  @ApiOperation({ summary: 'Obtenir detalls d\'un material per ID' })
  @ApiResponse({ status: 200, description: 'Material retornat correctament.' })
  @ApiResponse({ status: 404, description: 'Material no trobat.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar dades del material' })
  @ApiResponse({ status: 200, description: 'Material actualitzat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Material o estat no trobat.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEquipmentDto>) {
    return this.equipmentService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Canviar l\'estat d\'un material' })
  @ApiResponse({ status: 200, description: 'Estat del material actualitzat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Material o estat no trobat.' })
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto
  ) {
    return this.equipmentService.changeStatus(id, dto.statusId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER')
  @ApiOperation({ summary: 'Descatalogar material (soft delete)' })
  @ApiResponse({ status: 200, description: 'Material descatalogat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Material no trobat.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.remove(id);
  }
}