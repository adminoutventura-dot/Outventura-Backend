import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Crea una nova reserva (sempre en estat PENDING)' })
  @ApiResponse({ status: 201, description: 'Reserva creada correctament.' })
  @ApiResponse({ status: 400, description: 'L\'usuari està inactiu o dates incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Usuari no trobat.' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Llistar reserves amb filtres opcionals' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filtrar per usuari' })
  @ApiQuery({ name: 'guideId', required: false, type: Number, description: 'Filtrar per guia' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filtrar per data (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar per estat (PENDING, ACCEPTED...)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Pàgina (per defecte 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Resultats per pàgina (per defecte 10)' })
  @ApiResponse({ status: 200, description: 'Llista de reserves retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  findAll(
    @Query('userId') userId?: string,
    @Query('guideId') guideId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() currentUser?: any
  ) {
    return this.bookingService.findAll(
      {
        userId: userId ? +userId : undefined,
        guideId: guideId ? +guideId : undefined,
        date,
        status,
        page: page ? +page : undefined,
        limit: limit ? +limit : undefined,
      },
      currentUser
    );
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir una reserva per ID' })
  @ApiResponse({ status: 200, description: 'Reserva retornada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Reserva no trobada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE')
  @ApiOperation({ summary: 'Canviar l\'estat d\'una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualitzada correctament.' })
  @ApiResponse({ status: 400, description: 'Transició d\'estat no permesa o restricció de temps.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Reserva o estat no trobat.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() currentUser: any
  ) {
    return this.bookingService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar una reserva en curs.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Reserva no trobada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }
}