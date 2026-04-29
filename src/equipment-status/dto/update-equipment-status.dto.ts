import { PartialType } from '@nestjs/swagger';
import { CreateEquipmentStatusDto } from './create-equipment-status.dto';

export class UpdateEquipmentStatusDto extends PartialType(CreateEquipmentStatusDto) {}
