import { IsInt, IsDate } from 'class-validator';

export class GameLatencyGetDto {
  @IsInt()
  userIdx: number;

  @IsDate()
  serverDateTime: number;

  @IsDate()
  clientDateTime: number;
}
