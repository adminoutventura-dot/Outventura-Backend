import { Test, TestingModule } from '@nestjs/testing';
import { BookingLineService } from './booking-line.service';

describe('BookingLineService', () => {
  let service: BookingLineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingLineService],
    }).compile();

    service = module.get<BookingLineService>(BookingLineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
