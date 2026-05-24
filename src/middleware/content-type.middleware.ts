import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (['POST', 'PATCH'].includes(req.method) && !req.is('application/json')) {
            throw new BadRequestException('El Content-Type ha de ser application/json');
        }
        next();
    }
}