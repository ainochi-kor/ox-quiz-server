import { Test, TestingModule } from '@nestjs/testing';
import { QuizGateway } from './quiz.gateway';
import { QuizService } from './quiz.service';

describe('QuizGateway', () => {
  let gateway: QuizGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizGateway, QuizService],
    }).compile();

    gateway = module.get<QuizGateway>(QuizGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
