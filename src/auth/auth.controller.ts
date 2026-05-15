import { Controller, Post, Body, HttpCode, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Inici de sessió d\'usuari' })
  @ApiResponse({ status: 200, description: 'Retorna l\'usuari i el token JWT' })
  @ApiResponse({ status: 400, description: 'Dades de validació incorrectes.' })
  @ApiResponse({ status: 401, description: 'Credencials invàlides' })
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obté el perfil de l\'usuari autenticat' })
  @ApiResponse({ status: 200, description: 'Retorna les dades de l\'usuari autenticat' })
  @ApiResponse({ status: 401, description: 'No autenticat' })
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}