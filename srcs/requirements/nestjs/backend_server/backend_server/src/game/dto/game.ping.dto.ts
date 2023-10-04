export class GamePingDto {
  serverTime: number;

  //   constructor(userIdx: number) {
  //     this.serverTime = Date.now();
  // 	// console.log(`create for ${userIdx}`);
  //   }
  constructor() {
    this.serverTime = new Date().getTime();
  }
}

export class GamePingReceiveDto {
  userIdx: number;
  serverTime: number;
  clientTime: number;
}
