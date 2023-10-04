import { queue } from 'rxjs';
import { GamePlayer } from '../game.player/game.player';

export class GameQueue {
  playerList: GamePlayer[];

  constructor() {
    this.playerList = [];
  }

  getLength(): number {
    return this.playerList.length;
  }

  pushPlayer(player: GamePlayer): number {
    return this.playerList.push(player);
  }

  popPlayer(userIdx: number): GamePlayer[] {
    const user1Idx = this.playerList.findIndex(
      (user) => user.getUserObject().userIdx === userIdx,
    );
    const list = this.playerList.splice(user1Idx, 1);
    const target = this.playerList.splice(0, 1)[0];
    list.push(target);
    return list;
  }

  deletePlayer(userIdx: number) {
    let i = 0;
    for (const queueMember of this.playerList) {
      if (queueMember.getUserObject().userIdx === userIdx)
        this.playerList.splice(i, 1);
      i++;
    }
  }

  findPlayerById(userIdx: number): GamePlayer | null {
    let target: GamePlayer | null;
    target = null;
    for (const queue of this.playerList) {
      if (queue.getUserObject().userIdx === userIdx) {
        target = queue;
      }
    }
    return target;
  }
}
