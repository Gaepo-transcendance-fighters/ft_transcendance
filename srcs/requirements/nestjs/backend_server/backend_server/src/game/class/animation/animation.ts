import { FrameData } from 'src/game/enum/frame.data.enum';
import { GamePhase } from 'src/game/enum/game.phase';
import { KeyPress } from '../key.press/key.press';
import { GameData } from 'src/game/enum/game.data.enum';
import { Vector } from 'src/game/enum/game.vector.enum';
import { GameRoom } from '../game.room/game.room';

export class Animations {
  private totalDistancePerSec: number;
  private unitDistance: number;

  constructor(totalDistance: number) {
    this.totalDistancePerSec = totalDistance;
    this.unitDistance = 0;
  }

  public setUnitDistance(maxFps: number) {
    this.unitDistance = this.totalDistancePerSec / maxFps;
  }

  public getUnitDistance() {
    return this.unitDistance;
  }

  public bonusSetUnitDistance(value: number) {
    this.unitDistance += value;
  }

  // 기존 데이터를 기반으로 다음 프레임 연산을 진행한다.
  public makeFrame(room: GameRoom, key: KeyPress[]): GameData {
    // console.log(`각도가 ?! : ${room.gameObj.linearEquation[0]}`);
    const radianAngle = Math.atan(room.gameObj.linearEquation[0]);
    // console.log(`radianAngle : ${radianAngle}`);
    const cosAngle = Math.cos(radianAngle);
    // console.log(`cosAngle : ${cosAngle}`);
    const sinAngle = Math.sin(radianAngle);
    // console.log(`sinAngle : ${sinAngle}`);

    let newX: number;
    let newY: number;

    // newX = room.animation.unitDistance * cosAngle;
    // newY = room.animation.unitDistance * sinAngle;
    if (
      room.gameObj.vector === Vector.DOWNLEFT ||
      room.gameObj.vector === Vector.UPLEFT
    ) {
      newX = -room.animation.unitDistance * cosAngle;
      newY = -room.animation.unitDistance * sinAngle;
    } else if (
      room.gameObj.vector === Vector.DOWNRIGHT ||
      room.gameObj.vector === Vector.UPRIGHT
    ) {
      newX = room.animation.unitDistance * cosAngle;
      newY = room.animation.unitDistance * sinAngle;
    }
    room.gameObj.currentPos = [
      room.gameObj.currentPos[0] + newX,
      room.gameObj.currentPos[1] + newY,
    ];
    room.animation.unitDistance =
      room.animation.unitDistance +
      (room.gameObj.gameSpeed + 1) / (room.gameObj.frameData[1] * 10);

    // 페들 데이터 바꿈
    //TODO: 키보드 입력 잘못 들어올 수도 있음
    const paddle1 = key[0].popKeyValue();
    const paddle2 = key[1].popKeyValue();
    room.gameObj.paddle1[0] -= paddle1;
    room.gameObj.paddle1[1][0] -= paddle1;
    room.gameObj.paddle1[1][1] -= paddle1;
    room.gameObj.paddle2[0] -= paddle2;
    room.gameObj.paddle2[1][0] -= paddle2;
    room.gameObj.paddle2[1][1] -= paddle2;

    // 프레임 값 갱신
    room.gameObj.frameData[0] += 1;
    if (room.gameObj.frameData[0] === room.gameObj.frameData[1])
      room.gameObj.frameData[0] = 0;
    return room.gameObj;
  }
}
