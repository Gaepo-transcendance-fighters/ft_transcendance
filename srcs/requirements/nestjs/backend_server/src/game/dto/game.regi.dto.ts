import { IsNumber, IsDate } from 'class-validator';

export class GameRegiDto {
  @IsNumber()
  userIdx: number;

  @IsDate()
  queueDate: number;
}
