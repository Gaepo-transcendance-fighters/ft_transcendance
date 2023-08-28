import { GameBall } from '../game.ball/game.ball';
import { GamePlayer } from '../game.player/game.player';
import { GameOptions } from '../game.options/game.options';
import { GameChannel } from 'src/entity/gameChannel.entity';
import { GameRecord } from 'src/entity/gameRecord.entity';
import {
  GameType,
  RecordResult,
  RecordType,
} from 'src/game/enum/game.type.enum';
import { GameScoreDto } from 'src/game/dto/game.score.dto';
import { GameBallEventDto } from 'src/game/dto/game.ball.event.dto';

export class GameRoom {
  public roomId: string;
  public ballList: GameBall[];
  public user1: GamePlayer | null;
  public user2: GamePlayer | null;
  public option: GameOptions | null;
  public count: number;
  private gameChannelObject: GameChannel;
  private gameRecordObject: GameRecord[];
  private scoreData: GameScoreDto[];
  private eventData: GameBallEventDto[];

  constructor(roomId: string) {
    this.roomId = roomId;
    this.user1 = null;
    this.user2 = null;
    this.option = null;
    this.count = 0;
    this.gameRecordObject = [];
    this.scoreData = [];
    this.ballList = [];
    this.eventData = [];
    this.ballList.push(new GameBall(null));
  }

  public setUser(userData: GamePlayer, option: GameOptions): boolean {
    if (this.count == 0) this.user1 = userData;
    else this.user2 = userData;
    this.option = option;
    this.count++;
    return this.count === 2 ? true : false;
  }

  public setOptions(option: GameOptions) {
    if (option.getType() == GameType.FRIEND && this.count === 2) this.count = 0;
    this.option = option;
    this.count++;
    return this.count === 2 ? true : false;
  }

  public setChannelObject(channel: GameChannel) {
    this.gameChannelObject = channel;
  }

  public setRecordObject(record: GameRecord) {
    this.gameRecordObject.push(record);
  }

  public saveChannelObject(
    score1: number,
    score2: number,
    status: RecordResult,
  ): GameChannel {
    this.gameChannelObject.score1 = score1;
    this.gameChannelObject.score2 = score2;
    this.gameChannelObject.status = status;
    return this.gameChannelObject;
  }

  public saveRecordObject(
    score1: number,
    score2: number,
    result1: RecordResult,
    result2: RecordResult,
  ): GameRecord[] {
    const scoreFst = score1.toString().concat(` : ${score2.toString()}`);
    const scoreSec = score2.toString().concat(` : ${score1.toString()}`);
    this.gameRecordObject[0].result = result1;
    this.gameRecordObject[0].score = scoreFst.toString();
    this.gameRecordObject[1].result = result2;
    this.gameRecordObject[1].score = scoreSec.toString();
    return this.gameRecordObject;
  }

  public setScoreData(data: GameScoreDto): boolean {
    this.scoreData.push(data);
    if (this.scoreData.length == 1) return false;
    else return true;
  }

  public setEventData(data: GameBallEventDto): boolean {
    this.eventData.push(data);
    if (this.eventData.length == 1) return false;
    else return true;
  }

  public getScoreDataList(): GameScoreDto[] {
    return this.scoreData;
  }

  public getEventDataList(): GameBallEventDto[] {
    return this.eventData;
  }

  public getChannelObject(): GameChannel {
    return this.gameChannelObject;
  }

  public getRecrodObject(): GameRecord[] {
    return this.gameRecordObject;
  }

  public deleteScoreData() {
    this.scoreData.splice(0, 2);
    this.scoreData = [];
  }

  public deleteEventData() {
    this.eventData.splice(0, 2);
    this.eventData = [];
  }

  public deleteBallEvent() {
    this.ballList.splice(0, 2);
    this.ballList = [];
  }

  public predictBallCourse() {
    if (this.ballList.length == 2) {
      this.ballList.splice(0, 2);
    } else {
      this.ballList.splice(1);
    }
    this.ballList.push(new GameBall(null));
  }
}
