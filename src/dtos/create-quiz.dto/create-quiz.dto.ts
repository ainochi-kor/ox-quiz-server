// src/dtos/create-quiz.dto.ts
import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class QuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  answer: boolean;

  @IsString()
  answerDescription: string;

  @IsOptional()
  image?: string;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsArray()
  quizzes: QuestionDto[];
}
