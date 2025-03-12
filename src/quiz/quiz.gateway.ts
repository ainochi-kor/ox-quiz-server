import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Quiz } from './quiz.interface';
import { GAME_RESULT_STATUS } from 'src/constants/game';

interface Player {
  id: string;
  position: boolean;
  nickname?: string;
  characterImageId?: string;
}

type AnswerMap = Record<string, boolean>;

interface QuizData {
  questionIndex: number;
  question: string;
  description: string;
  image: string | undefined;
  timeLeft: number;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private players: Record<string, Player> = {}; // 참가자 목록
  private currentQuiz: Quiz | undefined = undefined; // 현재 진행 중인 퀴즈
  private currentQuestionIndex = 0; // 현재 문제 번호
  private answerMap: AnswerMap = {}; // 참가자의 답변 저장
  private questionTimer: NodeJS.Timeout | null = null; // 타이머 저장
  private timeLeft = 0; // 남은 시간
  private gameStarted = false; // 게임이 시작되었는지 여부
  private clients = new Set<string>();
  private socketIdToUserId = new Map<string, string>();

  constructor(private readonly quizService: QuizService) {}
  handleConnection(client: Socket) {
    const userId = (client.handshake.auth.userId as string) || client.id;

    if (typeof userId !== 'string') {
      console.warn(`⚠️ 잘못된 userId 타입:`, userId);
      client.disconnect();
      return;
    }

    console.log(`📡 클라이언트 연결됨: ${userId}`);
    this.clients.add(userId);
    console.log('clients', this.clients);
  }

  handleDisconnect(client: Socket) {
    const userId = client.id;
    console.log(`❌ 클라이언트 연결 해제: ${userId}`);
    this.clients.delete(userId);
    console.log(`🚮 클라이언트 제거 완료: ${userId}`);
  }

  /** 게임 시작 (관리자만 실행 가능) */
  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() data: { quizId: string; providerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('startGame', data.quizId, data.providerId);
    if (!data.providerId) {
      client.emit('error', { message: '권한이 없습니다.' });
      return;
    }

    const quiz = this.quizService.getQuizById(data.quizId);

    console.log('quiz', quiz);
    if (!quiz) {
      client.emit('error', { message: '퀴즈를 찾을 수 없습니다.' });
      return;
    }

    this.currentQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.gameStarted = true;

    const sec = 5;
    this.timeLeft = sec;
    this.server.emit('waitingForGame', {
      message: `${this.currentQuiz.title}\n게임 시작 ${this.timeLeft}초 전`,
    });

    const countdownInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.server.emit('waitingForGame', {
          message: `${this.currentQuiz?.title}\n게임 시작 ${this.timeLeft}초 전`,
        });
      } else {
        clearInterval(countdownInterval);
        this.startNextQuestion();
      }
    }, 1000);
  }

  /** 참가자 입장 */
  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody()
    data: { id: string; nickname: string; characterImageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('joinGame', data);

    if (this.gameStarted && !this.players[data.id]) {
      client.emit('error', { message: '이미 시작된 게임입니다.' });
      client.disconnect();
      return;
    }

    this.players[data.id] = {
      ...data,
      position: true,
    };
    this.socketIdToUserId.set(data.id, client.id);
    console.log('this.players', this.players);
    this.server.emit('updatePlayers', this.players);
  }

  /** 이미지 수정 */
  @SubscribeMessage('changeImage')
  handleChangeImage(
    @MessageBody()
    data: {
      id: string;
      characterImageId: string;
    },
  ) {
    console.log('changeImage', data);

    this.players[data.id] = {
      ...this.players[data.id],
      characterImageId: data.characterImageId,
    };
    console.log('this.players', this.players);
    this.server.emit('changeImage', this.players);
  }

  /** 문제 출제 */
  startNextQuestion() {
    console.log('startNextQuestion', this.currentQuestionIndex);
    console.log('currentQuiz', this.currentQuiz, this.currentQuestionIndex);

    if (!this.currentQuiz) {
      console.error('🚨 오류: currentQuiz가 정의되지 않음. 게임 종료 처리.');
      this.server.emit('gameOver', {
        state: null,
        message: '게임이 종료되었습니다!',
      });
      this.resetGame(); // 게임 상태 리셋
      return;
    }

    // 참가자가 한 명도 없을 경우 문제 출제 중지
    if (Object.keys(this.players).length === 0) {
      console.log('⚠️ 참가자가 없으므로 게임 종료.');
      this.server.emit('gameOver', {
        state: null,
        message: '참가자가 없습니다. 게임을 종료합니다.',
      });
      this.resetGame(); // 게임 상태 리셋
      return;
    }

    if (this.currentQuestionIndex >= this.currentQuiz.quizzes.length) {
      console.log('게임 종료');
      this.server.emit('gameOver', {
        state: GAME_RESULT_STATUS.WIN,
        message: '게임이 종료되었습니다!',
      });
      this.resetGame(); // 게임 상태 리셋
      return;
    }

    const question = this.currentQuiz.quizzes[this.currentQuestionIndex];

    this.answerMap = Object.keys(this.players).reduce(
      (obj: AnswerMap, playerId: string) => {
        obj[playerId] = this.players[playerId].position;
        return obj;
      },
      {} as AnswerMap,
    );
    this.timeLeft = 15;

    this.server.emit('nextQuestion', {
      questionIndex: this.currentQuestionIndex,
      question: question.title,
      description: question.description,
      image: question.image,
      timeLeft: this.timeLeft,
    } satisfies QuizData);

    this.questionTimer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        console.log('timeLeft', this.timeLeft);
        this.server.emit('currentQuestion', {
          questionIndex: this.currentQuestionIndex,
          question: question.title,
          description: question.description,
          image: question.image,
          timeLeft: this.timeLeft,
        } satisfies QuizData);
      } else {
        this.stopTimer();
        this.server.emit('waitingQuizResult', {});
        setTimeout(() => {
          this.checkAnswers();
        }, 1000);
      }
    }, 1000);
  }

  /** 타이머 정지 */
  private stopTimer() {
    console.log('stopTimer');
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  /** 유저 답변 제출 */
  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(@MessageBody() data: { id: string; position: boolean }) {
    this.answerMap[data.id] = data.position;
    this.players[data.id].position = data.position;

    this.server.emit('moveUser', {
      [data.id]: this.players[data.id],
    });
  }

  /** 정답 확인 및 탈락자 처리 */
  checkAnswers() {
    console.log('checkAnswers');
    this.stopTimer();

    const question = this.currentQuiz?.quizzes[this.currentQuestionIndex];
    const correctAnswer = question?.answer;

    const losers = Object.keys(this.players).filter((userId) => {
      console.log('this.answerMap', this.answerMap);
      console.log('this.answerMap[userId]', this.answerMap[userId]);
      console.log('correctAnswer', correctAnswer);
      return this.answerMap[userId] !== correctAnswer;
    });

    losers.forEach((userId) => {
      const looserSocketId = this.socketIdToUserId.get(userId);
      console.log('looserSocketId', looserSocketId);
      if (looserSocketId) {
        this.server.to(looserSocketId).emit('gameOver', {
          state: GAME_RESULT_STATUS.LOSE,
          message: '패배하였습니다.',
        });
        this.server.to(looserSocketId).disconnectSockets(true);
        delete this.players[userId];
      }
    });

    this.server.emit('updatePlayers', this.players);

    if (Object.keys(this.players).length === 0) {
      this.server.emit('gameOver', {
        state: GAME_RESULT_STATUS.LOSE,
        message: '모든 플레이어가 탈락하였습니다!',
      });
      this.resetGame(); // 게임 상태 리셋
      return;
    }

    if (Object.keys(this.players).length === 1) {
      const winnerId = Object.keys(this.players)[0];
      const winnerSocketId = this.socketIdToUserId.get(winnerId);

      if (winnerSocketId) {
        this.server.to(winnerSocketId).emit('gameOver', {
          state: GAME_RESULT_STATUS.WIN,
          message: '승리하였습니다!',
        });
        this.resetGame(); // 게임 상태 리셋
        this.server.to(winnerSocketId).disconnectSockets(true);
      }
    }

    setTimeout(() => {
      this.server.emit('waitingQuizNext', {});
      setTimeout(() => {
        this.currentQuestionIndex++;
        this.startNextQuestion();
      }, 3000);
    }, 1000);
  }

  /** 게임 상태 리셋 */
  private resetGame() {
    console.log('resetGame');
    this.currentQuiz = undefined;
    this.currentQuestionIndex = 0;
    this.answerMap = {};
    this.timeLeft = 0;
    this.gameStarted = false;
    this.players = {};
    this.stopTimer();
  }
}
