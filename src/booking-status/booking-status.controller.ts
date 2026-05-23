import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BookingStatusService } from './booking-status.service';
import { CreateBookingStatusDto } from './dto/create-booking-status.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Booking Status')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('booking-status')
export class BookingStatusController {
  constructor(private readonly bookingStatusService: BookingStatusService) { }

  @Post()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Crea un nou estat de reserva' })
  @ApiResponse({ status: 201, description: 'Estat creat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 409, description: 'Aquest codi ja existeix.' })
  create(@Body() dto: CreateBookingStatusDto) {
    return this.bookingStatusService.create(dto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Llistar tots els estats de reserva' })
  @ApiResponse({ status: 200, description: 'Llista d\'estats retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  findAll() {
    return this.bookingStatusService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir un estat de reserva per ID' })
  @ApiResponse({ status: 200, description: 'Estat retornat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingStatusService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar un estat de reserva' })
  @ApiResponse({ status: 200, description: 'Estat actualitzat correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingStatusService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER')
  @ApiOperation({ summary: 'Eliminar un estat de reserva' })
  @ApiResponse({ status: 200, description: 'Estat eliminat correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar si té reserves assignades.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Estat no trobat.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingStatusService.remove(id);
  }
}