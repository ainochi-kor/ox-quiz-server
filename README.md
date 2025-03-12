# OX 퀴즈 서버

이 프로젝트는 OX 퀴즈 서버 애플리케이션입니다. 사용자는 퀴즈를 생성하고, 관리하며, 참여할 수 있습니다. 이 서버는 API와 Socket을 사용하여 실시간으로 동작합니다.

## API 소개

### 퀴즈 관리 API

- `POST /api/quizzes` - 퀴즈 생성
- `GET /api/quizzes` - 모든 퀴즈 조회
- `GET /api/quizzes/roomlist` - 퀴즈 방 목록 조회
- `GET /api/quizzes/roomlist/:id` - 특정 퀴즈 방 조회
- `GET /api/quizzes/:id` - 특정 퀴즈 조회

### 소켓 통신

- `startGame` - 게임 시작
- `joinGame` - 게임 참가
- `changeImage` - 캐릭터 이미지 변경
- `submitAnswer` - 답변 제출
- `nextQuestion` - 다음 문제 출제
- `gameOver` - 게임 종료
- `updatePlayers` - 참가자 목록 업데이트
- `waitingForGame` - 게임 시작 대기
- `waitingQuizResult` - 퀴즈 결과 대기
- `waitingQuizNext` - 다음 퀴즈 대기
- `moveUser` - 유저 이동
- `currentQuestion` - 현재 문제 정보
