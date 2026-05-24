import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
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

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registre d\'un nou usuari' })
  @ApiResponse({ status: 201, description: 'Usuari registrat correctament.' })
  @ApiResponse({ status: 400, description: 'Dades de validació incorrectes.' })
  @ApiResponse({ status: 409, description: 'El correu ja està registrat.' })
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obté el perfil de l\'usuari autenticat' })
  @ApiResponse({ status: 200, description: 'Retorna les dades de l\'usuari autenticat' })
  @ApiResponse({ status: 401, description: 'No autenticat' })
  getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id_user);
  }
}