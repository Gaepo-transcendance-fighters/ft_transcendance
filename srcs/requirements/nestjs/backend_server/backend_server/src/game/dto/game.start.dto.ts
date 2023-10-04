// import { GameBall } from '../class/game.ball/game.ball';

import { GameRoom } from '../class/game.room/game.room';

export class GameStartDto {
  animationStartDate: number;
  ballX: number;
  ballY: number;
  paddle1: number;
  paddle2: number;
  score1: number;
  score2: number;

  constructor(room: GameRoom) {
    this.animationStartDate = Date.now() + 3000;
    this.ballX = 0;
    this.ballY = 0;
    this.paddle1 = 0;
    this.paddle2 = 0;
    this.score1 = 0;
    this.score2 = 0;
  }
}
