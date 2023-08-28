import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { FriendList } from '../../entity/friendList.entity';

export class FollowFriendDto {
  myIdx : number;
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'intra is unique' })
  targetNickname: string;
  targetIdx : number;
}

export class FriendResDto {
  friendList: FriendList[];
}

export class FriendDto {
  frindNickname : string;
  friendIdx : number;
  isOnline : boolean;
}