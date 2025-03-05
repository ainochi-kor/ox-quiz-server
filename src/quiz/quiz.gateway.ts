// src/gateways/quiz.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class QuizGateway {
  @WebSocketServer()
  server: Server;

  private players: Record<string, 'O' | 'X'> = {};

  @SubscribeMessage('joinQuiz')
  handleJoinQuiz(@MessageBody() data: { userId: string; position: 'O' | 'X' }) {
    this.players[data.userId] = data.position;
    this.server.emit('updatePlayers', this.players);
  }

  @SubscribeMessage('changePosition')
  handleChangePosition(
    @MessageBody() data: { userId: string; position: 'O' | 'X' },
  ) {
    this.players[data.userId] = data.position;
    this.server.emit('updatePlayers', this.players);
  }
}
