import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activitiesService: ActivityService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Crear activitat' })
  @ApiResponse({ status: 201, description: 'Activitat creada correctament.' })
  @ApiResponse({ status: 400, description: 'Restricció de temps, guia inactiu o conflicte de dates.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Guia no trobat.' })
  create(@Body() dto: CreateActivityDto, @CurrentUser() currentUser: any) {
    return this.activitiesService.create(dto, currentUser);
  }

  @Post(':id/category/:catId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Assignar una categoria a una activitat' })
  @ApiResponse({ status: 201, description: 'Categoria assignada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Activitat o categoria no trobada.' })
  addCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('catId', ParseIntPipe) catId: number
  ) {
    return this.activitiesService.addCategoryToActivity(id, catId);
  }

  @Get('available')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER', 'GUEST')
  @ApiOperation({ summary: 'Llistar activitats disponibles (data futura)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Llista d\'activitats disponibles retornada.' })
  findAvailable(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findAll({
      available: true,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get()
  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER', 'GUEST')
  @ApiOperation({ summary: 'Llistar activitats amb filtres opcionals i paginació' })
  @ApiQuery({ name: 'guideId', required: false, type: Number })
  @ApiQuery({ name: 'difficulty', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Pàgina (per defecte 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Resultats per pàgina (per defecte 10)' })
  @ApiResponse({ status: 200, description: 'Llista d\'activitats retornada.' })
  findAll(
    @Query('guideId') guideId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findAll({
      guideId: guideId ? +guideId : undefined,
      difficulty: difficulty ? +difficulty : undefined,
      categoryId: categoryId ? +categoryId : undefined,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER', 'GUEST')
  @ApiOperation({ summary: 'Obtenir detalls d\'una activitat per ID' })
  @ApiResponse({ status: 200, description: 'Activitat retornada correctament.' })
  @ApiResponse({ status: 404, description: 'Activitat no trobada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Actualitzar una activitat' })
  @ApiResponse({ status: 200, description: 'Activitat actualitzada correctament.' })
  @ApiResponse({ status: 400, description: 'Restricció de dates o aforament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Activitat no trobada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateActivityDto>,
    @CurrentUser() currentUser: any
  ) {
    return this.activitiesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Eliminar una activitat' })
  @ApiResponse({ status: 200, description: 'Activitat eliminada correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar si té reserves.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients o no ets el guia.' })
  @ApiResponse({ status: 404, description: 'Activitat no trobada.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any
  ) {
    return this.activitiesService.remove(id, currentUser);
  }
}