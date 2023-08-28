import { WaitPlayerTuple } from '../game.wait.queue/game.wait.queue';

export class GameQueue {
  queueData: WaitPlayerTuple[];

  constructor() {
    this.queueData = [];
  }

  public Enqueue(player: WaitPlayerTuple) {
    this.queueData.push(player);
  }

  public DequeueList(): WaitPlayerTuple[] | null {
    if (this.queueData.length < 2) return null;
    const data: WaitPlayerTuple[] = [];
    data.push(this.queueData[0]);
    data.push(this.queueData[1]);
    this.queueData.splice(0, 2);
    return data;
  }

  public isEmpty(): boolean {
    return this.queueData.length == 0 ? true : false;
  }
  public size() {
    return this.queueData.length;
  }
}
