import { Test, TestingModule } from '@nestjs/testing';
import { BookingLineController } from './booking-line.controller';
import { BookingLineService } from './booking-line.service';

describe('BookingLineController', () => {
  let controller: BookingLineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingLineController],
      providers: [BookingLineService],
    }).compile();

    controller = module.get<BookingLineController>(BookingLineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
