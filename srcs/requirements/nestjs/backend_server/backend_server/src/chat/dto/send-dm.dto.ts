import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class SendDMDto {
  // @MaxLength(100)
  // @MinLength(1)
  // targetNickname: string;

  @IsString()
  @IsNotEmpty()
  //   @Matches(/^[a-zA-Z0-9]*$/, { message: 'nickname is unique' })
  @MaxLength(2000)
  msg: string;
}
