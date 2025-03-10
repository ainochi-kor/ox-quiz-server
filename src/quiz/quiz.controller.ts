// src/controllers/quiz.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
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

  @Get('/roomlist')
  getQuizRoomList() {
    return this.quizService.getQuizRoomList();
  }
  @Get('/roomlist/:id')
  getQuizRoom(@Param('id') id: string) {
    return this.quizService.getQuizRoom(id);
  }

  @Get(':id')
  getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }
}
