import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ActivityLogMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        const { method, originalUrl, ip } = req;

        let userId: number | undefined;
        let userRole: string | undefined;

        const authHeader = req.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                userId = decoded.sub;
                userRole = decoded.role;
            } catch {
                // Token invàlid o expirat, continuem sense usuari
            }
        }

        res.on('finish', () => {
            const duration = Date.now() - start;
            const statusCode = res.statusCode;

            if (originalUrl.startsWith('/activity-log')) return;

            this.prisma.activityLog.create({
                data: {
                    method,
                    url: originalUrl,
                    statusCode,
                    ip: ip ?? null,
                    userId: userId ?? null,
                    userRole: userRole ?? null,
                    duration,
                }
            }).catch(err => console.error('Error guardant ActivityLog:', err));
        });

        next();
    }
}