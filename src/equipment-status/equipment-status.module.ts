import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EquipmentStatusController } from './equipment-status.controller';
import { EquipmentStatusService } from './equipment-status.service';

@Module({
  imports: [PrismaModule],
  controllers: [EquipmentStatusController],
  providers: [EquipmentStatusService],
})
export class EquipmentStatusModule { }
