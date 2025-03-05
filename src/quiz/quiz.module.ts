import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizGateway } from './quiz.gateway';

@Module({
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
})
export class QuizModule {}
