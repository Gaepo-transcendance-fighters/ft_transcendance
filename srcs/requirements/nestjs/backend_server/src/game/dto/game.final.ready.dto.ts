import { GameRoom } from '../class/game.room/game.room';

export class GameFinalReadyDto {
  userNicknameFirst: string;
  userIdxFirst: number;
  firstLatency: number;
  userNicknameSecond: string;
  userIdxSecond: number;
  secondLatency: number;

  constructor(target: GameRoom) {
    this.userNicknameFirst = target.user1.userObject.nickname;
    this.userIdxFirst = target.user1.userIdx;
    this.firstLatency = target.user1.getLatency();
    this.userNicknameSecond = target.user2.userObject.nickname;
    this.userIdxSecond = target.user2.userIdx;
    this.secondLatency = target.user2.getLatency();
  }
}
