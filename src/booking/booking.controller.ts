import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Crea una nova reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada correctament.' })
  @ApiResponse({ status: 400, description: 'Dades incorrectes.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Usuari o estat no trobat.' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar totes les reserves' })
  @ApiResponse({ status: 200, description: 'Llista de reserves retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir una reserva per ID' })
  @ApiResponse({ status: 200, description: 'Reserva retornada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Reserva no trobada.' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar l\'estat d\'una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva actualitzada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Reserva o estat no trobat.' })
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Reserva no trobada.' })
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}