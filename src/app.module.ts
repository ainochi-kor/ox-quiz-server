import { Module } from '@nestjs/common';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [QuizModule],
})
export class AppModule {}
