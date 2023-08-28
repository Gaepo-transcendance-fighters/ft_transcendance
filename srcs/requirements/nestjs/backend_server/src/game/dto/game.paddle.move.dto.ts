import { IsInt } from 'class-validator';

export class GamePaddleMoveDto {
  @IsInt()
  userIdx: number;

  @IsInt()
  clientDate: number;

  @IsInt()
  paddleInput: number;
}
