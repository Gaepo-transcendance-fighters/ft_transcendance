import { IsEnum } from 'class-validator';
import { GameType, GameSpeed, MapNumber } from '../enum/game.type.enum';

export class GameSmallOptionDto {
  @IsEnum(GameType, {
    message: 'Is not invalid Enum.',
  })
  gameType: GameType;

  @IsEnum(GameSpeed, {
    message: 'Is not invalid Enum.',
  })
  speed: GameSpeed;

  @IsEnum(MapNumber, {
    message: 'Is not invalid Enum.',
  })
  mapNumber: MapNumber;

  constructor(type: GameType, speed: GameSpeed, mapNumber: MapNumber) {
    this.gameType = type;
    this.speed = speed;
    this.mapNumber = mapNumber;
  }
}
