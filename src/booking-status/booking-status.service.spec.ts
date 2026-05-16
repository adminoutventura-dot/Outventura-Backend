import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatusService } from './booking-status.service';

describe('BookingStatusService', () => {
  let service: BookingStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingStatusService],
    }).compile();

    service = module.get<BookingStatusService>(BookingStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
