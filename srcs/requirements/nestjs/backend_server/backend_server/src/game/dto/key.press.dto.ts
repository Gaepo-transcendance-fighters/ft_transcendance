import { IsInt } from 'class-validator';

export class KeyPressDto {
  @IsInt()
  userIdx: number;
  @IsInt()
  paddle: number;
  @IsInt()
  serverTime: number;
  @IsInt()
  clientTime: number;
  @IsInt()
  cntPerFrame: number;
}
