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

  getQuizRoom(id: string) {
    const quiz = this.quizzes.find((quiz) => quiz.id === id);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return {
      id: quiz.id,
      title: quiz.title,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  getQuizRoomList() {
    console.log('getQuizRoomList');
    const quizRoomList = this.quizzes.map((quiz) => {
      return {
        id: quiz.id,
        title: quiz.title,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    });

    console.log(quizRoomList);
    return quizRoomList;
  }
}
