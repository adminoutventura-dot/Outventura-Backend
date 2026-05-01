import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Inici de sessió d\'usuari' })
  @ApiResponse({ status: 200, description: 'Retorna l\'usuari i el token JWT' })
  @ApiResponse({ status: 401, description: 'Credencials invàlides' })
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }
}