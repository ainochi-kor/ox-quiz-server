// src/controllers/quiz.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from 'src/dtos/create-quiz.dto/create-quiz.dto';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  createQuiz(@Body() data: CreateQuizDto) {
    return this.quizService.createQuiz(data);
  }

  @Get()
  getQuizzes() {
    return this.quizService.getQuizzes();
  }

  @Get(':id')
  getQuizById(id: string) {
    return this.quizService.getQuizById(id);
  }
}
