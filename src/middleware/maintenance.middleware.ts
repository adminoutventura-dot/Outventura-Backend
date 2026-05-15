import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (process.env.MAINTENANCE_MODE === 'true') {
            throw new ServiceUnavailableException('API en manteniment. Torna-ho a intentar més tard.');
        }
        next();
    }
}