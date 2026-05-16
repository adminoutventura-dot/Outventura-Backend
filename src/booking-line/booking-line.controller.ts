import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingLineService } from './booking-line.service';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('Booking Lines')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('booking-line')
export class BookingLineController {
  constructor(private readonly bookingLineService: BookingLineService) { }

  @Post()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Afegir una línia a una reserva' })
  @ApiResponse({ status: 201, description: 'Línia creada correctament.' })
  @ApiResponse({ status: 400, description: 'Cal especificar equipment o activitat, no els dos.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Reserva, material o activitat no trobat.' })
  create(@Body() dto: CreateBookingLineDto) {
    return this.bookingLineService.create(dto);
  }

  @Get()
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Llistar totes les línies de reserva' })
  @ApiResponse({ status: 200, description: 'Llista de línies retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  findAll() {
    return this.bookingLineService.findAll();
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir una línia de reserva per ID' })
  @ApiResponse({ status: 200, description: 'Línia retornada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  findOne(@Param('id') id: string) {
    return this.bookingLineService.findOne(+id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Actualitzar una línia de reserva' })
  @ApiResponse({ status: 200, description: 'Línia actualitzada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  update(@Param('id') id: string, @Body() dto: UpdateBookingLineDto) {
    return this.bookingLineService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('SUPER', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar una línia de reserva' })
  @ApiResponse({ status: 200, description: 'Línia eliminada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  remove(@Param('id') id: string) {
    return this.bookingLineService.remove(+id);
  }
}