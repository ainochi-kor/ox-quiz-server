import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from 'src/dtos/create-quiz.dto/create-quiz.dto';
import { v4 as uuidv4 } from 'uuid';
import { Quiz } from './quiz.interface';

@Injectable()
export class QuizService {
  private quizzes: Quiz[] = [];

  createQuiz(data: CreateQuizDto) {
    const newQuiz: Quiz = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.quizzes.push(newQuiz); // 🔥 이제 오류 없음

    console.log(this.quizzes);
    return newQuiz;
  }

  getQuizzes() {
    return this.quizzes;
  }

  getQuizById(id: string) {
    return this.quizzes.find((quiz) => quiz.id === id);
  }
}
