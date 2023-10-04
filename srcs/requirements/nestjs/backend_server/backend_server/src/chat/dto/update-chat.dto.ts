import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';
import { OnlineStatus } from 'src/entity/users.entity';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  id: number;
}

export class UserStatusDto{
  constructor(
    isOnline: OnlineStatus, 
    check2Auth: boolean, 
    nickname: string
    ) {
    
    this.isOnline = isOnline;
    this.check2Auth = check2Auth;
    this.nickname = nickname;
  }
  isOnline: OnlineStatus;
  check2Auth: boolean;
  nickname: string;
}