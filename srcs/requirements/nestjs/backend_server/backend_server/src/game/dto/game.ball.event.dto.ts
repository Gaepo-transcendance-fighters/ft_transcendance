import { IsInt, IsString } from 'class-validator';

export class GameBallEventDto {
  @IsString()
  roomId?: string;

  @IsInt()
  ballPosX: number;
  @IsInt()
  ballPosY: number;
  @IsInt()
  ballDegreeX: number;
  @IsInt()
  ballDegreeY: number;
  @IsInt()
  ballHitDate?: number;
}
