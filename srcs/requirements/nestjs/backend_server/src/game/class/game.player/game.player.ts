import { UserObject } from 'src/entity/users.entity';
import { Socket } from 'socket.io';
export class GamePlayer {
  userIdx: number;
  userObject: UserObject;
  socket: Socket;
  paddlePosY: number;
  latency: number; //ms
  score: number;

  constructor(userIdx: number, userObject: UserObject, socket: Socket) {
    this.userIdx = userIdx;
    this.userObject = userObject;
    this.socket = socket;
    // this.paddlePosY = 0;
    this.latency = -1;
    this.score = 0;
  }

  //   public resetPlayer() {
  //     this.paddlePosY = 0;
  //   }

  public setLatency(value: number) {
    this.latency = value;
  }

  public getLatency(): number {
    return this.latency;
  }

  public setScore(): number {
    this.score += 1;
    return this.score;
  }
}
