export class GameServerTimeDto {
  roomId: string;
  serverDateTime: number;

  constructor(roomId: string, time: number) {
    this.roomId = roomId;
    this.serverDateTime = time;
  }
}
