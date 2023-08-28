import { IsEnum, IsNumber } from 'class-validator';
import { GameType, GameSpeed, MapNumber } from '../enum/game.type.enum';

export class GameOptionDto {
  @IsEnum(GameType, {
    message: 'Is not invalid Enum.',
  })
  gameType: GameType;

  @IsNumber()
  userIdx: number;

  @IsEnum(GameSpeed, {
    message: 'Is not invalid Enum.',
  })
  speed: GameSpeed;

  @IsEnum(MapNumber, {
    message: 'Is not invalid Enum.',
  })
  mapNumber: MapNumber;

  constructor(
    type: GameType,
    userIdx: number,
    speed: GameSpeed,
    mapNumber: MapNumber,
  ) {
    this.gameType = type;
    this.userIdx = userIdx;
    this.speed = speed;
    this.mapNumber = mapNumber;
  }
}
