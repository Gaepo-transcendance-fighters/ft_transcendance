import { UserObject } from 'src/entity/users.entity';
import { Socket } from 'socket.io';
import { GameOptionDto } from '../../dto/game.option.dto';

export enum PlayerPhase {
  SET_OPTION = 0,
  CONNECT_SOCKET,
  QUEUE_SUCCESS,
  PING_CHECK,
  PING_DONE,
  ON_PLAYING,
  ON_READY,
  MATCH_END,
}

export class GamePlayer {
  private userObject: UserObject;
  private socket: Socket | null;
  private options: GameOptionDto | null;
  private ready: boolean;
  public playerStatus: PlayerPhase;

  constructor(user: UserObject) {
    this.userObject = user;
    this.socket = null;
    this.options = null;
    this.ready = false;
  }

  setSocket(socket: Socket) {
    this.socket = socket;
  }

  setOptions(data: GameOptionDto) {
    this.options = data;
  }

  setUserObject(target: UserObject) {
    this.userObject = target;
  }

  getUserObject() {
    return this.userObject;
  }

  getOption() {
    return this.options;
  }

  getSocket() {
    return this.socket;
  }

  setReady(userIdx: number) {
    if (this.userObject.userIdx === userIdx) this.ready = true;
    else this.ready = false;
  }

  getReady(): boolean {
    return this.ready;
  }

  emitToClient(event: string, data: any) {
    if (this.socket instanceof Socket) this.socket.emit(event, data);
  }
}
