import { IsInt } from 'class-validator';

export class GameFriendMatchDto {
  @IsInt()
  userIdx: number;

  @IsInt()
  targetUserIdx: number;
}
