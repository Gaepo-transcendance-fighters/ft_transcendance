/**
 * 게임의 프레임 데이터 저장용.
 */
export interface FrameData {
  ballX: number;
  ballY: number;
  paddle1: number;
  paddle2: number;
  maxFrameRate: number;
  currentFrame: number;
}
/**
 * 60, 30, 24 프레임 대응을 위해 제작한 enum
 */
export enum Fps {
  FULL = 2,
  HALF = 4,
  LOW = 5,
  SUPERLOW = 12,
  ERROR = 0,
}
