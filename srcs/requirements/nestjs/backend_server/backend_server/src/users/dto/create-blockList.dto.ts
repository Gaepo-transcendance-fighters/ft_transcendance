import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlockListDto {
  @IsNotEmpty()
  @IsString()
  targetNickname: string;
}
