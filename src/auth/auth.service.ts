// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credencials incorrectes');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credencials incorrectes');
    }

    const payload = {
      sub: user.id_user,
      email: user.email,
      role: user.role.code
    };

    return {
      user: {
        id: user.id_user,
        name: user.name,
        email: user.email,
        role: user.role.code
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}