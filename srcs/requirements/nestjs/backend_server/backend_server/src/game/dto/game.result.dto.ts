import { GameChannel } from 'src/entity/gameChannel.entity';
import { GameRecord } from 'src/entity/gameRecord.entity';
import { UserObject } from 'src/entity/users.entity';

export class GameResultDto {
  user1Idx: number;
  user1Nickname: string;
  user1win: number;
  user1lose: number;
  user1rankpoint: number;
  user2Idx: number;
  user2Nickname: string;
  user2win: number;
  user2lose: number;
  user2rankpoint: number;
  score: string; // "score : score" 구조로 전 달함
  winnerIdx: number;

  constructor(
    result: GameChannel,
    user1: UserObject,
    user2: UserObject,
    winner: number,
  ) {
    this.user1Idx = user1.userIdx;
    this.user1Nickname = user1.nickname;
    this.user1win = user1.win;
    this.user1lose = user1.lose;
    this.user1rankpoint = user1.rankpoint;
    this.user2Idx = user2.userIdx;
    this.user2Nickname = user2.nickname;
    this.user2win = user2.win;
    this.user2lose = user2.lose;
    this.user2rankpoint = user2.rankpoint;
    this.score = `${result.score1} : ${result.score2}`; // "score : score" 구조로 전 달함
    this.winnerIdx = winner;
  }
}
