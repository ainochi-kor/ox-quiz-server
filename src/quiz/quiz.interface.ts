import { QuestionDto } from 'src/dtos/create-quiz.dto/create-quiz.dto';

export interface Quiz {
  id: string;
  title: string;
  quizzes: QuestionDto[];
  createdAt: string;
  updatedAt: string;
}
