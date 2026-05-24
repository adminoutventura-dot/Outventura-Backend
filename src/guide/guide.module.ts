import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';

@Module({
  imports: [PrismaModule],
  controllers: [GuideController],
  providers: [GuideService],
})
export class GuideModule { }