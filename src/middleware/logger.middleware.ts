import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const elapsed = Date.now() - start;
            const token = req.get('authorization') ? '🔒 authenticated' : '🔓 anonymous';
            this.logger.log(`[${token}] ${method} ${originalUrl} ${statusCode} - ${elapsed}ms - ${ip} - ${userAgent}`);
        });

        next();
    }
}