import { GameBall } from '../class/game.ball/game.ball';

export class GameStartDto {
  animationStartDate: number;
  ballDegreeX: number;
  ballDegreeY: number;
  ballNextPosX: number;
  ballNextPosY: number;
  ballExpectedEventDate: number;

  constructor(start: number, expected: number, ball: GameBall) {
    this.animationStartDate = start;
    this.ballDegreeX = ball.degreeX;
    this.ballDegreeY = ball.degreeY;
    this.ballNextPosX = ball.nextX;
    this.ballNextPosY = ball.nextY;
    this.ballExpectedEventDate = expected;
  }
}
