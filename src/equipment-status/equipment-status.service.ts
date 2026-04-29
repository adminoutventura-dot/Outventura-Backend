import { Injectable } from '@nestjs/common';
import { CreateEquipmentStatusDto } from './dto/create-equipment-status.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';

@Injectable()
export class EquipmentStatusService {
  create(createEquipmentStatusDto: CreateEquipmentStatusDto) {
    return 'This action adds a new equipmentStatus';
  }

  findAll() {
    return `This action returns all equipmentStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} equipmentStatus`;
  }

  update(id: number, updateEquipmentStatusDto: UpdateEquipmentStatusDto) {
    return `This action updates a #${id} equipmentStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} equipmentStatus`;
  }
}
