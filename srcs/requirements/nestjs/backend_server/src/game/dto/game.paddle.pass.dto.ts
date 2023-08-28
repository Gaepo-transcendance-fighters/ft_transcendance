export class GamePaddlePassDto {
  targetLatency: number;
  paddleInput: number;

  constructor(latency: number, paddle: number) {
    this.targetLatency = latency;
    this.paddleInput = paddle;
  }
}
