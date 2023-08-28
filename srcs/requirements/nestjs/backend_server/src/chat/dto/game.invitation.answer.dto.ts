import { IsBoolean, IsInt, IsString } from 'class-validator';
import { UserObject } from 'src/entity/users.entity';

export class GameInvitationAnswerDto {
  @IsInt()
  inviteUserIdx: number;
  @IsInt()
  targetUserIdx: number;
  @IsBoolean()
  answer: boolean;

  constructor(user1: number, user2: number, answer: boolean) {
    this.inviteUserIdx = user1;
    this.targetUserIdx = user2;
    this.answer = answer;
  }
}

export class GameInvitationAnswerPassDto {
  @IsInt()
  inviteUserIdx: number;
  @IsString()
  inviteUserNickname: string;
  @IsInt()
  targetUserIdx: number;
  @IsString()
  targetUserNickname: string;
  @IsBoolean()
  answer: boolean;

  constructor(user1: UserObject, user2: UserObject, answer: boolean) {
    this.inviteUserIdx = user1.userIdx;
    this.targetUserIdx = user2.userIdx;
    this.inviteUserNickname = user1.nickname;
    this.targetUserNickname = user2.nickname;
    this.answer = answer;
  }
}
