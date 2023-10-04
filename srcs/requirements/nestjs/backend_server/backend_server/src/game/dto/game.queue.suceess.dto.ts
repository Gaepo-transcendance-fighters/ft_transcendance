import { GamePlayer } from '../class/game.player/game.player';
import { GameType, GameSpeed, MapNumber } from '../enum/game.type.enum';
import { GameOptionDto } from './game.option.dto';

export class GameQueueSuccessDto {
  dbKey: number;
  userNicknameFirst: string;
  userIdxFirst: number;
  userNicknameSecond: string;
  userIdxSecond: number;
  successDate: Date;
  gameType: GameType;
  speed: GameSpeed;
  mapNumber: MapNumber;

  constructor(dbIdx: number, players: GamePlayer[], type: GameType, speed: GameSpeed, map: MapNumber) {
    this.dbKey = dbIdx;
    this.userNicknameFirst = players[0].getUserObject().nickname;
    this.userIdxFirst = players[0].getUserObject().userIdx;
    this.userNicknameSecond = players[1].getUserObject().nickname;
    this.userIdxSecond = players[1].getUserObject().userIdx;
    this.successDate = new Date();
	this.gameType = type;
	this.speed = speed;
	this.mapNumber = map;
  }
}
