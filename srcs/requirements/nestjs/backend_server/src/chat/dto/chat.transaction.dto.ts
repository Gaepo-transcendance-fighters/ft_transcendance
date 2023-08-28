import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Channel } from '../class/chat.channel/channel.class';
import { OnlineStatus } from 'src/entity/users.entity';

export class ChatGeneralReqDto {
  @IsInt()
  @IsOptional()
  targetIdx: number;

  @IsString()
  @IsOptional()
  targetNickname: string;

  @IsInt()
  @IsOptional()
  channelIdx: number;

  @IsInt()
  @IsOptional()
  userIdx: number;

  @IsString()
  @IsOptional()
  msg: string;

  @IsString()
  @IsOptional()
  password: string;
}

export class ChatMainEnterReqDto {
  @IsString()
  intra: string;
}

export class ChatEnterReqDto {
  @IsString()
  userIdx: number;

  @IsString()
  userNickname: string;

  @IsInt()
  channelIdx: number;

  @IsString()
  password: string;
}

export class ChatSendMsgReqDto {
  @IsInt()
  channelIdx: number;

  @IsInt()
  senderIdx: number;

  @IsString()
  msg: string;

  @IsInt()
  targetIdx: number;
}

export class ChatRoomAdminReqDto {
  @IsInt()
  channelIdx: number;

  @IsInt()
  userIdx: number;

  @IsBoolean()
  grant: boolean;
}

export class ChatRoomSetPasswordReqDto {
  @IsInt()
  channelIdx: number;

  @IsInt()
  userIdx: number;

  @IsString()
  changePassword: string;
}

export class chatGetProfileDto {
  constructor(
    targetNickname: string,
    imgUri: string,
    rank: number,
    win: number,
    lose: number,
    isOnline: OnlineStatus,
  ) {
    this.targetNickname = targetNickname;
    this.img = imgUri;
    this.rank = rank;
    this.win = win;
    this.lose = lose;
    this.isOnline = isOnline;
  }

  targetNickname: string;
  img: string;
  rate: number;
  rank: number;
  win: number;
  lose: number;
  isOnline: OnlineStatus;
}
