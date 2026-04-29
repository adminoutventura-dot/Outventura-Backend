import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EquipmentStatusService } from './equipment-status.service';
import { CreateEquipmentStatusDto } from './dto/create-equipment-status.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';

@Controller('equipment-status')
export class EquipmentStatusController {
  constructor(private readonly equipmentStatusService: EquipmentStatusService) {}

  @Post()
  create(@Body() createEquipmentStatusDto: CreateEquipmentStatusDto) {
    return this.equipmentStatusService.create(createEquipmentStatusDto);
  }

  @Get()
  findAll() {
    return this.equipmentStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEquipmentStatusDto: UpdateEquipmentStatusDto) {
    return this.equipmentStatusService.update(+id, updateEquipmentStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipmentStatusService.remove(+id);
  }
}
