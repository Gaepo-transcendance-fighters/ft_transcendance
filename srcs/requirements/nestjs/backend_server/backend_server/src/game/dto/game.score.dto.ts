import { IsInt } from 'class-validator';

export class GameScoreDto {
  @IsInt()
  userIdx: number;
  @IsInt()
  score: number;
  @IsInt()
  getScoreTime: number;
}
