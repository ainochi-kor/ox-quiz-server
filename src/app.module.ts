import { Module } from '@nestjs/common';
import { QuizService } from './quiz/quiz.service';
import { QuizGateway } from './quiz/quiz.gateway';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [QuizModule],
  providers: [QuizService, QuizGateway],
})
export class AppModule {}
