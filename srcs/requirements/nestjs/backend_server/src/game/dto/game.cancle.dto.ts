import { IsInt } from 'class-validator';

export class GameCancleDto {
  @IsInt()
  userIdx: number;
}
