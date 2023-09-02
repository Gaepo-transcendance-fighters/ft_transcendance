import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { FriendList } from '../../entity/friendList.entity';
import { OnlineStatus } from 'src/entity/users.entity';

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

export class FriendListResDto {
  FriendList: FriendDto[];
}

export class FriendDto {
  friendNickname : string;
  friendIdx : number;
  isOnline : OnlineStatus;
}