import { IsInt } from 'class-validator';

export class GameBasicAnswerDto {
  @IsInt()
  userIdx: number;
}
