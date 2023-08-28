import { GameBallEventDto } from 'src/game/dto/game.ball.event.dto';
import { Vector } from 'src/game/enum/game.vector.enum';

export class GameBall {
  initX: number;
  initY: number;
  degreeX: number;
  degreeY: number;
  nextX: number;
  nextY: number;
  vector: Vector;
  isValid: boolean;

  constructor(ballEvent: GameBallEventDto | null) {
    if (ballEvent === null) {
      this.initX = 0;
      this.initY = 0;
      this.nextX = 0;
      this.nextY = 0;
      this.degreeX = this.getRandomInt(-2, 2);
      this.degreeY = this.getRandomInt(-2, 2);
      if (this.degreeX == 2 && this.degreeY == 2) {
        this.degreeX = 1;
        this.degreeY = 1;
      } else if (this.degreeX == 2 && this.degreeY == -2) {
        this.degreeX = 1;
        this.degreeY = -1;
      } else if (this.degreeX == -2 && this.degreeY == 2) {
        this.degreeX = -1;
        this.degreeY = 1;
      } else {
        this.degreeX = -1;
        this.degreeY = -1;
      }
      this.vector = this.checkVector();
      this.operateNextPos();
    } else {
      this.initX = ballEvent.ballPosX;
      this.initY = ballEvent.ballPosY;
      this.degreeX = ballEvent.ballDegreeX;
      this.degreeY = ballEvent.ballDegreeY;
      this.nextX = 0;
      this.nextY = 0;
      this.vector = this.checkVector();
      this.operateNextPos();
    }
  }

  private checkVector(): Vector {
    let up = true;
    let right = true;
    let ret = 0;

    if (this.degreeX < 0) right = false;
    if (this.degreeY < 0) up = false;

    if (right == true && up == true) {
      ret = Vector.UPRIGHT;
    } else if (right == true && up == false) {
      ret = Vector.DOWNRIGHT;
    } else if (right == false && up == true) {
      ret = Vector.UPLEFT;
    } else {
      ret = Vector.DWONLEFT;
    }

    return ret;
  }

  public getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    let ret = Math.floor(Math.random() * (max - min + 1)) + min;
    if (ret == 0) ret = 1;
    return ret;
  }

  public setBall(ballEvent: GameBallEventDto) {
    if (ballEvent.ballDegreeX == 0 && ballEvent.ballDegreeY == 0) {
      ballEvent.ballDegreeX = this.getRandomInt(-2, 2);
      ballEvent.ballDegreeY = this.getRandomInt(-2, 2);
    }
    this.initX = ballEvent.ballPosX;
    this.initY = ballEvent.ballPosY;
    this.degreeX = ballEvent.ballDegreeX;
    this.degreeY = ballEvent.ballDegreeY;
    this.nextX = 0;
    this.nextY = 0;
    console.log(`
		init X : ${this.initX},
		init Y : ${this.initY},
		degree X : ${this.degreeX},
		degree Y : ${this.degreeY},
		Vector : ${this.vector},
	`);
    this.operateNextPos();
    console.log(`
		Next X = ${this.nextX},
		Next Y = ${this.nextY}
`);
    // switch (this.vector) {
    //   case Vector.UPRIGHT:
    //     this.vector = Vector.DOWNRIGHT;
    //     break;
    //   case Vector.UPLEFT:
    //     this.vector = Vector.DWONLEFT;
    //     break;
    //   case Vector.DOWNRIGHT:
    //     this.vector = Vector.UPRIGHT;
    //     break;
    //   case Vector.DWONLEFT:
    //     this.vector = Vector.UPLEFT;
    //     break;
    // }
    // this.degreeY *= -1;
    // this.checkVector();
  }

  private operateNextPos() {
    const p2x = this.initX + this.degreeX;
    const p2y = this.initY + this.degreeY;
    const a = (p2y - this.initY) / (p2x - this.initX);
    const b = p2y - a * p2x;
    this.checkVector();
    console.log(`degree : ${this.degreeX}, ${this.degreeY}`);
    console.log(`vector: ${this.vector}`);
    switch (this.vector) {
      case Vector.UPRIGHT:
        this.nextY = 300;
        break;
      case Vector.UPLEFT:
        this.nextY = 300;
        break;
      case Vector.DOWNRIGHT:
        this.nextY = -300;
        break;
      case Vector.DWONLEFT:
        this.nextY = -300;
        break;
    }
    this.nextX = (this.nextY - b) / a;
    console.log(`공경로 : ${this.nextX}, ${this.nextY}`);
  }

  public getPrediction(latency: number): any {
    const expectedTime = Date.now() + latency;
    const startTime = Date.now();
    return {
      animationStartDate: startTime,
      ballNextPosX: this.nextX,
      ballNextPosY: this.nextY,
      ballExpectedEventDate: expectedTime,
    };
  }

  public setValid(value: boolean) {
    this.isValid = value;
  }

  public getValid() {
    return this.isValid;
  }
}
