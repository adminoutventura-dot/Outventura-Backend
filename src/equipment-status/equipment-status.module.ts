import { Module } from '@nestjs/common';
import { EquipmentStatusService } from './equipment-status.service';
import { EquipmentStatusController } from './equipment-status.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentStatusController],
  providers: [EquipmentStatusService],
})
export class EquipmentStatusModule { }
