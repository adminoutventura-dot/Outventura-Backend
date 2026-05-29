import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';

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

    if (!user.status) {
      throw new UnauthorizedException(
        'El teu perfil està inactiu temporalment. Contacta amb un administrador.'
      );
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

  async register(dto: RegisterAuthDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existing) throw new ConflictException('Aquest correu ja està registrat');

    const userRole = await this.prisma.role.findUnique({
      where: { code: 'USER' }
    });
    if (!userRole) throw new NotFoundException('Rol USER no trobat');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        roleId: userRole.id_role,
        experience_level: dto.experience_level ?? 'BEGINNER',
      },
      include: { role: true }
    });

    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        photo: true,
        status: true,
        experience_level: true,
        createdAt: true,
        role: { select: { code: true, description: true } },
        guide: { select: { credentials: true } },
      },
    });

    if (!user) throw new NotFoundException('Usuari no trobat');

    const { status, guide, ...rest } = user;

    return {
      ...rest,
      status: status ? 'ACTIU' : 'INACTIU',
      ...(guide && { guide }),
    };
  }
}