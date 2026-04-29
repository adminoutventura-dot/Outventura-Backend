import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentStatusService } from './equipment-status.service';

describe('EquipmentStatusService', () => {
  let service: EquipmentStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipmentStatusService],
    }).compile();

    service = module.get<EquipmentStatusService>(EquipmentStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
