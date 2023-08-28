import { IsInt } from 'class-validator';

export class GameInvitationDto {
  @IsInt()
  myUserIdx: number;

  @IsInt()
  targetUserIdx: number;
}
