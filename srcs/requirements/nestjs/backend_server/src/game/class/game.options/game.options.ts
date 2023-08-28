import { GameOptionDto } from 'src/game/dto/game.option.dto';
import { GameType, GameSpeed, MapNumber } from '../../enum/game.type.enum';
export class GameOptions {
  private type: GameType;
  private speed: GameSpeed;
  private mapNumber: MapNumber;

  constructor(options: GameOptionDto) {
    this.type = options.gameType;
    this.speed = options.speed;
    this.mapNumber = options.mapNumber;
  }

  public getType(): GameType {
    return this.type;
  }

  public getSpeed(): GameSpeed {
    return this.speed;
  }

  public getMapNumber(): MapNumber {
    return this.mapNumber;
  }
}
