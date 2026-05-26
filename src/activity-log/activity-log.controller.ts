import { Controller, Get, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Activity Log')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) { }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar el registre d\'activitat del sistema' })
  @ApiQuery({ name: 'method', required: false, type: String, description: 'Filtrar per mètode HTTP (GET, POST, PATCH, DELETE)' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filtrar per ID d\'usuari' })
  @ApiQuery({ name: 'statusCode', required: false, type: Number, description: 'Filtrar per codi de resposta (200, 401, 403...)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Pàgina (per defecte 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Resultats per pàgina (per defecte 20)' })
  @ApiResponse({ status: 200, description: 'Registre d\'activitat retornat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  findAll(
    @Query('method') method?: string,
    @Query('userId') userId?: string,
    @Query('statusCode') statusCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogService.findAll({
      method,
      userId: userId ? +userId : undefined,
      statusCode: statusCode ? +statusCode : undefined,
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Delete('clear')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Esborrar tot el registre d\'activitat' })
  @ApiResponse({ status: 200, description: 'Registre esborrat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  clear() {
    return this.activityLogService.clear();
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Esborrar un registre d\'activitat per ID' })
  @ApiResponse({ status: 200, description: 'Registre esborrat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Registre no trobat.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activityLogService.remove(id);
  }
}