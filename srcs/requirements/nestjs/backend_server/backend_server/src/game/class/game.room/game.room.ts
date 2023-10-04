import { GameRecord } from 'src/entity/gameRecord.entity';
import { GamePlayer } from '../game.player/game.player';
import {
  GameSpeed,
  GameType,
  MapNumber,
  RecordResult,
} from 'src/game/enum/game.type.enum';
import { Vector } from 'src/game/enum/game.vector.enum';
import { GameChannel } from 'src/entity/gameChannel.entity';
import { GameData } from 'src/game/enum/game.data.enum';
import { KeyPress } from 'src/game/class/key.press/key.press';
import { Animations } from 'src/game/class/animation/animation';
import { GamePhase } from 'src/game/enum/game.phase';
import { Physics } from '../physics/physics';

/**
 * 연산의 핵심. 간단한 데이터를 제외하곤 여기서 연산이 이루어 진다.
 */
export class GameRoom {
  roomId: string;
  intervalId: any;
  intervalPeriod: number; // 서버 -(좌표)-> 클라이언트 -(키 입력)-> 서버  -(좌표, 키 입력)-> 클라이언트
  users: GamePlayer[];
  gameObj: GameData;
  latency: number[];
  latencyCnt: number[];
  animation: Animations;
  physics: Physics;
  keyPress: KeyPress[];
  history: GameRecord[];
  channel: GameChannel;

  constructor(
    id: string,
    users: GamePlayer[],
    type: GameType,
    speed: GameSpeed,
    mapNumber: MapNumber,
    histories: GameRecord[],
    channel: GameChannel,
    totalDistancePerSec: number,
  ) {
    this.roomId = id;
    this.intervalId = null;
    this.intervalPeriod = 0;
    this.users = users;
    this.gameObj = {
      currentPos: [0, 0],
      anglePos: [0, 0],
      standardPos: [0, 0],
      frameData: [0, 0],
      linearEquation: [0, 0],
      vector: Vector.UPRIGHT,
      paddle1: [0, [-40, 40]],
      paddle2: [0, [-40, 40]],
      score: [0, 0],
      gamePhase: GamePhase.SET_NEW_GAME,
      gameType: type,
      gameSpeed: speed,
      gameMapNumber: mapNumber,
    };

    this.latency = [];
    this.latency.push(0);
    this.latency.push(0);

    this.latencyCnt = [];
    this.latencyCnt.push(0);
    this.latencyCnt.push(0);

    this.animation = new Animations(totalDistancePerSec);
    this.physics = new Physics();

    this.keyPress = [];
    this.keyPress[0] = new KeyPress();
    this.keyPress[1] = new KeyPress();
    this.keyPress[0].setMaxUnit(totalDistancePerSec);
    this.keyPress[1].setMaxUnit(totalDistancePerSec);

    this.history = histories;
    this.channel = channel;
  }

  // 게임을 초기화한다.
  public setNewGame(room: GameRoom) {
    room.gameObj = {
      currentPos: [0, 0],
      anglePos: [0, 0],
      standardPos: [0, 0],
      frameData: [0, 0],
      linearEquation: [0, 0],
      vector: Vector.UPRIGHT,
      paddle1: [0, [-45, 45]],
      paddle2: [0, [-45, 45]],
      score: [0, 0],
      gamePhase: GamePhase.SET_NEW_GAME,
      gameType: room.gameObj.gameType,
      gameSpeed: room.gameObj.gameSpeed,
      gameMapNumber: room.gameObj.gameMapNumber,
    };
    room.setRandomStandardCoordinates();
    // room.animation.setRenewLinearEquation(room.gameObj);
    room.keyPress[0].setRenewKeypress();
    room.keyPress[1].setRenewKeypress();
  }

  public setReGame(room: GameRoom) {
    room.gameObj = {
      currentPos: [0, 0],
      anglePos: [0, 0],
      standardPos: [0, 0],
      frameData: [0, 0],
      linearEquation: [0, 0],
      vector: Vector.UPRIGHT,
      paddle1: [0, [-45, 45]],
      paddle2: [0, [-45, 45]],
      score: [room.gameObj.score[0], room.gameObj.score[1]],
      gamePhase: GamePhase.SET_NEW_GAME,
      gameType: room.gameObj.gameType,
      gameSpeed: room.gameObj.gameSpeed,
      gameMapNumber: room.gameObj.gameMapNumber,
    };
    room.setRandomStandardCoordinates();
    // room.animation.setRenewLinearEquation(room.gameObj);
    room.keyPress[0].setRenewKeypress();
    room.keyPress[1].setRenewKeypress();
  }

  public setLatency(latency: number, room: GameRoom): number {
    // console.log(`target latency -> ${latency}`);
    let maxFps;
    if (latency < 15) {
      maxFps = 60;
    } else if (latency >= 15 && latency < 100) {
      maxFps = 30;
    } else if (latency >= 100) {
      maxFps = 10;
    } else {
      //TODO: Error Handling
    }
    room.gameObj.frameData[1] = maxFps;
    room.animation.setUnitDistance(maxFps);
    // // console.log(`MaxFPS? -> ${maxFps}`);
    if (maxFps == 60) room.intervalPeriod = 15;
    else if (maxFps == 30) room.intervalPeriod = 30;
    else if (maxFps == 24) room.intervalPeriod = 40;
    else room.intervalPeriod = 80;
    room.keyPress[0].setPressedNumberByMaxFps(maxFps);
    room.keyPress[1].setPressedNumberByMaxFps(maxFps);
    return maxFps;
  }

  public setIntervalId(id: any) {
    this.intervalId = id;
  }

  public getIntervalId(): any {
    return this.intervalId;
  }

  public stopInterval() {
    clearInterval(this.intervalId);
  }

  public getMaxFps(): number {
    return this.gameObj.frameData[1];
  }

  public getIntervalMs(): number {
    return this.intervalPeriod;
  }

  public keyPressed(userIdx: number, value: number) {
    // // console.log(`key pressed by : ${userIdx}`);
    if (this.users[0].getUserObject().userIdx === userIdx) {
      this.keyPress[0].pushKey(value);
      //   // console.log(`key value : ${this.keyPress[0].getHowManyKey()}`);
    } else if (this.users[1].getUserObject().userIdx === userIdx) {
      this.keyPress[1].pushKey(value);
      //   // console.log(`key value : ${this.keyPress[1].getHowManyKey()}`);
    }
  }

  public makeNextFrame(room: GameRoom) {
    room.gameObj = room.animation.makeFrame(room, room.keyPress);
    // console.log(`${room.gameObj.frameData[0]} / ${room.gameObj.frameData[1]}`);
    // console.log(`============================================`);
    // // console.log(
    //   `공 좌표 [X , Y] : [${room.getGameData().currentPos[0]} , ${
    //     room.getGameData().currentPos[1]
    //   }]`,
    // );
    // // console.log(
    //   `각도 계산용 [X , Y] : [${room.getGameData().standardPos[0]} , ${
    //     room.getGameData().standardPos[1]
    //   }]`,
    // );
    // // console.log(
    //   `기준 각도 좌표 [X , Y] : [${room.getGameData().anglePos[0]} , ${
    //     room.getGameData().anglePos[1]
    //   }]`,
    // );
    // // console.log(`기울기 a : ${room.getGameData().linearEquation[0]}`);
    // // console.log(`절편 b : ${room.getGameData().linearEquation[1]}`);
    // // console.log(`페들 1 : ${room.getGameData().paddle1[0]}`);
    // // console.log(
    //   `페들 1 [min , Max] : [${room.getGameData().paddle1[1][0]} , ${
    //     room.getGameData().paddle1[1][1]
    //   }]`,
    // );
    // // console.log(`페들 2 : ${room.getGameData().paddle2[0]}`);
    // // console.log(
    //   `페들 2 [min , Max]: [${room.getGameData().paddle2[1][0]} , ${
    //     room.getGameData().paddle2[1][1]
    //   }]`,
    // );
    if (room.getGameData().vector === Vector.UPLEFT) {
      // console.log(`벡터 : UP-LEFT`);
    } else if (room.getGameData().vector === Vector.UPRIGHT) {
      // console.log(`벡터 : UP-RIGHT`);
    } else if (room.getGameData().vector === Vector.DOWNLEFT) {
      // console.log(`벡터 : DOWN-LEFT`);
    } else if (room.getGameData().vector === Vector.DOWNRIGHT) {
      // console.log(`벡터 : DOWN-RIGHT`);
    }
    // console.log(`============================================`);

    room.gameObj = room.physics.checkPhysics(room.gameObj, room.physics, room);

    if (
      room.gameObj.gamePhase === GamePhase.HIT_THE_PADDLE ||
      room.gameObj.gamePhase === GamePhase.HIT_THE_WALL ||
      room.gameObj.gamePhase === GamePhase.HIT_THE_GOAL_POST
    ) {
      if (room.gameObj.gamePhase === GamePhase.HIT_THE_GOAL_POST) {
        // console.log('Hit The Post!!!');
      } else if (room.gameObj.gamePhase === GamePhase.HIT_THE_PADDLE) {
        // console.log('Hit The Paddle!!!');
      } else {
        // console.log('Hit The Wall!!!');
      }
      // console.log(
      //     `${room.gameObj.frameData[0]} / ${room.gameObj.frameData[1]}`,
      //   );
      //   // console.log(`============================================`);
      //   // console.log(
      //     `공 좌표 [X , Y] : [${room.getGameData().currentPos[0]} , ${
      //       room.getGameData().currentPos[1]
      //     }]`,
      //   );
      //   // console.log(
      //     `각도 계산용 [X , Y] : [${room.getGameData().standardPos[0]} , ${
      //       room.getGameData().standardPos[1]
      //     }]`,
      //   );
      //   // console.log(
      //     `기준 각도 좌표 [X , Y] : [${room.getGameData().anglePos[0]} , ${
      //       room.getGameData().anglePos[1]
      //     }]`,
      //   );
      //   // console.log(`기울기 a : ${room.getGameData().linearEquation[0]}`);
      //   // console.log(`절편 b : ${room.getGameData().linearEquation[1]}`);
      //   // console.log(`페들 1 : ${room.getGameData().paddle1[0]}`);
      //   // console.log(
      //     `페들 1 [min , Max] : [${room.getGameData().paddle1[1][0]} , ${
      //       room.getGameData().paddle1[1][1]
      //     }]`,
      //   );
      //   // console.log(`페들 2 : ${room.getGameData().paddle2[0]}`);
      //   // console.log(
      //     `페들 2 [min , Max]: [${room.getGameData().paddle2[1][0]} , ${
      //       room.getGameData().paddle2[1][1]
      //     }]`,
      //   );
      if (room.getGameData().vector === Vector.UPLEFT) {
        // console.log(`벡터 : UP-LEFT`);
      } else if (room.getGameData().vector === Vector.UPRIGHT) {
        // console.log(`벡터 : UP-RIGHT`);
      } else if (room.getGameData().vector === Vector.DOWNLEFT) {
        // console.log(`벡터 : DOWN-LEFT`);
      } else if (room.getGameData().vector === Vector.DOWNRIGHT) {
        // console.log(`벡터 : DOWN-RIGHT`);
      }
      // console.log(`============================================`);
    }
    if (room.gameObj.gamePhase !== GamePhase.HIT_THE_GOAL_POST)
      room.gameObj.gamePhase = GamePhase.ON_PLAYING;
    room.gameObj = room.checkScore(room.gameObj);
  }

  public checkScore(gameData: GameData): GameData {
    if (gameData.gamePhase === GamePhase.HIT_THE_GOAL_POST) {
      if (gameData.score[0] === 5 || gameData.score[1] === 5) {
        gameData.gamePhase = GamePhase.MATCH_END;
      } else {
        gameData.gamePhase = GamePhase.SET_NEW_GAME;
      }
    } else {
      gameData.gamePhase = GamePhase.ON_PLAYING;
    }
    return gameData;
  }

  public getChannel(): GameChannel {
    return this.channel;
  }

  public getHistories(): GameRecord[] {
    return this.history;
  }

  public getGameData(): GameData {
    return this.gameObj;
  }

  public setRandomStandardCoordinates() {
    while (1) {
      const vector = this.getRandomInt(1, 4);
      if (vector === Vector.UPLEFT) {
        this.gameObj.anglePos = [
          this.getRandomInt(-5, -1),
          this.getRandomInt(-5, -1),
        ];
      } else if (vector === Vector.UPRIGHT) {
        this.gameObj.anglePos = [
          this.getRandomInt(1, 5),
          this.getRandomInt(-5, -1),
        ];
      } else if (vector === Vector.DOWNLEFT) {
        this.gameObj.anglePos = [
          this.getRandomInt(-5, -1),
          this.getRandomInt(1, 5),
        ];
      } else {
        this.gameObj.anglePos = [
          this.getRandomInt(1, 5),
          this.getRandomInt(1, 5),
        ];
      }
      let down = true;
      let right = true;

      if (this.gameObj.anglePos[0] < 0) right = false;
      if (this.gameObj.anglePos[1] < 0) down = false;

      this.gameObj.standardPos[0] = this.gameObj.anglePos[0];
      this.gameObj.standardPos[1] = this.gameObj.anglePos[1];

      if (right == true && down == true) {
        this.gameObj.vector = Vector.DOWNRIGHT;
      } else if (right == true && down == false) {
        this.gameObj.vector = Vector.UPRIGHT;
      } else if (right == false && down == true) {
        this.gameObj.vector = Vector.DOWNLEFT;
      } else {
        this.gameObj.vector = Vector.UPLEFT;
      }

      this.gameObj.linearEquation[0] =
        (this.gameObj.standardPos[1] - this.gameObj.currentPos[1]) /
        (this.gameObj.standardPos[0] - this.gameObj.currentPos[0]);
      this.gameObj.linearEquation[1] =
        this.gameObj.standardPos[1] -
        this.gameObj.linearEquation[0] * this.gameObj.standardPos[0];
      if (
        this.gameObj.linearEquation[0] >= 1 ||
        this.gameObj.linearEquation[0] < -1
      )
        break;
    }
  }

  //   public setRenewLinearEquation(room: GameRoom) {
  //     this.gameObj.angle =
  //       (this.gameObj.standardY - 0) / (this.gameObj.standardX - 0);
  //     this.gameObj.yIntercept =
  //       this.gameObj.standardY - this.gameObj.angle * 0;
  //   }

  public getRandomInt(min: number, max: number): number {
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    if (randomValue == 0) randomValue = 1;
    return randomValue;
  }

  public getGamePhase(): GamePhase {
    return this.gameObj.gamePhase;
  }

  public setGamePhase(value: GamePhase) {
    this.gameObj.gamePhase = value;
  }

  public deleteRoom(): string {
    this.intervalId = undefined;
    this.intervalPeriod = undefined; // 서버 -(좌표)-> 클라이언트 -(키 입력)-> 서버  -(좌표, 키 입력)-> 클라이언트
    this.users[0].getSocket().disconnect(true);
    this.users[0].setSocket(undefined);
    this.users[1].getSocket().disconnect(true);
    this.users[1].setSocket(undefined);
    this.gameObj = undefined;
    this.latency = undefined;
    this.latencyCnt = undefined;
    delete this.animation;
    delete this.physics;
    delete this.keyPress[0];
    delete this.keyPress[1];
    this.keyPress = undefined;
    this.history[0] = undefined;
    this.history[1] = undefined;
    this.channel = undefined;
    return this.roomId;
  }

  public syncStatus(room: GameRoom) {
    const history1 = room.history[0];
    const history2 = room.history[1];
    const channel = room.channel;
    history1.score = `${room.gameObj.score[0]} : ${room.gameObj.score[1]}`;
    history2.score = `${room.gameObj.score[1]} : ${room.gameObj.score[0]}`;
    if (room.gameObj.score[0] === 5) {
      history1.result = RecordResult.WIN;
      history2.result = RecordResult.LOSE;
    } else if (room.gameObj.score[1] === 5) {
      history1.result = RecordResult.LOSE;
      history2.result = RecordResult.WIN;
    }
    channel.score1 = room.gameObj.score[0];
    channel.score2 = room.gameObj.score[1];
    channel.status = RecordResult.DONE;
    room.history.splice(0, 2);
    room.history.push(history1);
    room.history.push(history2);
    room.channel = channel;
  }
}
