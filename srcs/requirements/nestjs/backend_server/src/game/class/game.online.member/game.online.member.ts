import { UserObject } from 'src/entity/users.entity';
import { Socket } from 'socket.io';

export class GameOnlineMember {
  userSocket: Socket;
  user: UserObject;

  constructor(user: UserObject, socket: Socket) {
    this.user = user;
    this.userSocket = socket;
  }
}
