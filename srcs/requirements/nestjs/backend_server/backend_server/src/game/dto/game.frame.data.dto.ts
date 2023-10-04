import { FrameData } from '../enum/frame.data.enum';
import { GameData } from '../enum/game.data.enum';

export class GameFrameDataDto {
  ballX: number;
  ballY: number;
  paddle1: number;
  paddle2: number;
  serverTime: number;
  targetFrame: number;
  cntPerFrame: number;

  constructor(data: FrameData | null, serverTime: number | null) {
    if (data !== null) {
      this.ballX = data.ballX;
      this.ballY = data.ballY;
      this.paddle1 = data.paddle1;
      this.paddle2 = data.paddle2;
      this.serverTime = serverTime;
      this.targetFrame = data.maxFrameRate;
      this.cntPerFrame = data.currentFrame;
    } else {
      this.ballX = 0;
      this.ballY = 0;
      this.paddle1 = 0;
      this.paddle2 = 0;
      this.serverTime = 0;
      this.targetFrame = 0;
      this.cntPerFrame = 0;
    }
  }

  setData(data: GameData, serverTime: number) {
    this.ballX = data.currentPos[0];
    this.ballY = data.currentPos[1];
    this.paddle1 = data.paddle1[0];
    this.paddle2 = data.paddle2[0];
    this.serverTime = serverTime;
    this.targetFrame = data.frameData[1];
    this.cntPerFrame = data.frameData[0];
  }
}
