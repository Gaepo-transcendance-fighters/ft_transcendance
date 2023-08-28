import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class BlockTargetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'intra is unique' })
  targetNickname: string;
}

export class BlockListDto {
  @IsNotEmpty()
  idx: number;

  @IsNotEmpty()
  userIdx: number;

  @IsNotEmpty()
  blockedUserIdx: number;

  @IsNotEmpty()
  blockedNickname: string;

  blockedTime: Date;
}

export class BlockInfoDto {
  @IsNotEmpty()
  userNickname: string;

  @IsNotEmpty()
  userIdx: number;
}
