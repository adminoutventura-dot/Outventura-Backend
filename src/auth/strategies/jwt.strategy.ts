import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET no definit al .env');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }


    async validate(payload: { sub: number; email: string; role: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id_user: payload.sub },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException('Usuari no vàlid');
        }

        if (!user.status) {
            throw new UnauthorizedException(
                'El teu perfil està inactiu temporalment. Contacta amb un administrador.'
            );
        }

        return user;
    }
}