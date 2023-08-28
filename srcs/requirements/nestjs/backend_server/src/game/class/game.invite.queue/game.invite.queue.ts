import { GamePlayer } from '../game.player/game.player';
// import { GameOptions } from '../game.options/game.options';

export class GameInviteQueue {
  queueData: GamePlayer[];

  constructor() {
    this.queueData = [];
  }

  public Enqueue(user1: GamePlayer, user2: GamePlayer): boolean {
    // const userFst = this.queueData.find(
    //   (user) => user.userIdx === user1.userIdx,
    // );
    // const userSecond = this.queueData.find(
    //   (user) => user.userIdx === user2.userIdx,
    // );
    // if (userFst !== undefined && userSecond !== undefined) {
    //   return true;
    // } else {
    //   this.queueData.push(user1);
    //   this.queueData.push(user2);
    //   return false;
    // }
    this.queueData.push(user1);
    this.queueData.push(user2);
    const userFirst = this.queueData.filter(
      (user) => user.userIdx === user1.userIdx,
    );
    console.log(userFirst.length);
    if (userFirst.length === 1) return false;
    for (let i = 0; i < this.queueData.length; i++) {
      if (
        this.queueData[i].userIdx === user1.userIdx ||
        this.queueData[i].userIdx === user2.userIdx
      ) {
        this.queueData.splice(i, 1);
        i = 0;
      }
    }
    return true;
  }

  public Dequeue(user1: GamePlayer, user2: GamePlayer): GamePlayer[] | null {
    const data: GamePlayer[] = [];
    for (let index = 0; index < this.queueData.length; index++) {
      if (this.queueData[index].userIdx == user1.userIdx) {
        data.push(user1);
        this.queueData.splice(index, 1);
      } else if (this.queueData[index].userIdx == user2.userIdx) {
        data.push(user2);
        this.queueData.splice(index,1);
      }
      if (data.length == 2) break;
    }
    if (data.length > 2 && data.length < 2) return null;
    return data;
  }
  public isEmpty(): boolean {
    return this.queueData.length == 0 ? true : false;
  }
  public size() {
    return this.queueData.length;
  }
}
