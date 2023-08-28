import { IsInt, IsString } from 'class-validator';

export class GameInvitationAskDto {
  @IsInt()
  userIdx: number;

  @IsString()
  userNickname: string;

  constructor(userIdx: number, nickname: string) {
    this.userIdx = userIdx;
    this.userNickname = nickname;
  }
}
