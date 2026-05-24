import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { BookingLineService } from './booking-line.service';
import { CreateBookingLineDto } from './dto/create-booking-line.dto';
import { UpdateBookingLineDto } from './dto/update-booking-line.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
  @ApiResponse({ status: 400, description: 'Validació incorrecta (estat, aforament, duplicats, antelació, material...).' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Reserva, material o activitat no trobat.' })
  create(@Body() dto: CreateBookingLineDto, @CurrentUser() currentUser: any) {
    return this.bookingLineService.create(dto, currentUser);
  }

  @Get()
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Llistar línies de reserva' })
  @ApiQuery({ name: 'bookingId', required: false, type: Number, description: 'Filtrar per número de reserva' })
  @ApiResponse({ status: 200, description: 'Llista de línies retornada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  findAll(@Query('bookingId') bookingId?: string) {
    return this.bookingLineService.findAll(bookingId ? +bookingId : undefined);
  }

  @Get(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Obtenir una línia de reserva per ID' })
  @ApiResponse({ status: 200, description: 'Línia retornada correctament.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingLineService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Actualitzar una línia de reserva' })
  @ApiResponse({ status: 200, description: 'Línia actualitzada correctament.' })
  @ApiResponse({ status: 400, description: 'Restricció de temps o unitats insuficients.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'Sense permisos suficients.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingLineDto,
    @CurrentUser() currentUser: any
  ) {
    return this.bookingLineService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles('SUPER', 'ADMIN', 'GUIDE', 'USER')
  @ApiOperation({ summary: 'Eliminar una línia de reserva (només SUPER/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Línia eliminada correctament.' })
  @ApiResponse({ status: 400, description: 'No es pot eliminar una línia d\'una reserva en curs o finalitzada.' })
  @ApiResponse({ status: 401, description: 'No autenticat.' })
  @ApiResponse({ status: 403, description: 'GUIDE i USER no poden eliminar línies, només cancelar la reserva.' })
  @ApiResponse({ status: 404, description: 'Línia no trobada.' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    return this.bookingLineService.remove(id, currentUser);
  }
}