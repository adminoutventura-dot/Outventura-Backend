import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentStatusController } from './equipment-status.controller';
import { EquipmentStatusService } from './equipment-status.service';

describe('EquipmentStatusController', () => {
  let controller: EquipmentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentStatusController],
      providers: [EquipmentStatusService],
    }).compile();

    controller = module.get<EquipmentStatusController>(EquipmentStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
