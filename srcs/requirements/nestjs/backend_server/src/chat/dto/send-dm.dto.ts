import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class SendDMDto {
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(100)
  // @MinLength(1)
  // @Matches(/^[a-zA-Z0-9]*$/, { message: 'nickname is unique' })
  // targetNickname: string;

  @MaxLength(2000)
  msg: string;
}
