import { FrameData } from 'src/game/enum/frame.data.enum';
import { GamePhase } from 'src/game/enum/game.phase';
import { KeyPress } from '../key.press/key.press';
import { GameData } from 'src/game/enum/game.data.enum';
import { Vector } from 'src/game/enum/game.vector.enum';
import { GameRoom } from '../game.room/game.room';
import { verify } from 'crypto';
import e from 'express';
import { LessThan } from 'typeorm';

export class Physics {
  private readonly MAX_WIDTH = 500;
  private readonly MIN_WIDTH = -500;
  private readonly MAX_HEIGHT = 250;
  private readonly MIN_HEIGTH = -250;
  private readonly PADDLE_LINE_1 = -470;
  private readonly PADDLE_LINE_2 = 470;

  constructor() {}

  checkPhysics(gameData: GameData, engine: Physics, room: GameRoom): GameData {
    gameData.paddle1 = engine.correctPaddleDatas(gameData.paddle1, engine);
    gameData.paddle2 = engine.correctPaddleDatas(gameData.paddle2, engine);
    // wall 부딪힘 여부 판단
    if (engine.checkHitTheWall(gameData.currentPos, gameData.vector, engine)) {
      gameData.gamePhase = GamePhase.HIT_THE_WALL;
      gameData = engine.correctLinearEquation(gameData, engine, room);
    }
    // 페들 부딪힘 여부 판단
    if (
      engine.checkHitThePaddle(gameData.currentPos, gameData.vector, engine)
    ) {
      if (engine.needToCorrection(gameData)) {
        // // console.log('페들 입력시 여기로 들어갈까?!');
        gameData.gamePhase = GamePhase.HIT_THE_PADDLE;
        gameData = engine.correctLinearEquation(gameData, engine, room);
      }
    }
    // Score 획득 여부 판단

    engine.checkHitTheGoalPost(
      gameData.currentPos,
      gameData.vector,
      engine,
      gameData,
    );
    return gameData;
  }

  private needToCorrection(gameData: GameData): boolean {
    let ret: boolean;
    ret = false;
    if (
      gameData.vector === Vector.UPLEFT ||
      gameData.vector === Vector.DOWNLEFT
    ) {
      if (
        gameData.paddle1[1][0] <= gameData.currentPos[1] &&
        gameData.paddle1[1][1] >= gameData.currentPos[1]
      )
        ret = true;
      else {
        if (gameData.currentPos[0] === -450) {
          const min = gameData.currentPos[1] - 20;
          const max = gameData.currentPos[1] + 20;
          if (
            (gameData.paddle1[1][0] <= min && gameData.paddle1[1][1] >= min) ||
            (gameData.paddle1[1][0] <= max && gameData.paddle1[1][1] >= max)
          ) {
            ret = true;
          }
        }
      }
    } else {
      if (
        gameData.paddle2[1][0] <= gameData.currentPos[1] &&
        gameData.paddle2[1][1] >= gameData.currentPos[1]
      )
        ret = true;
      else {
        if (gameData.currentPos[0] === 450) {
          const min = gameData.currentPos[1] - 20;
          const max = gameData.currentPos[1] + 20;
          if (
            (gameData.paddle2[1][0] <= min && gameData.paddle2[1][1] >= min) ||
            (gameData.paddle2[1][0] <= max && gameData.paddle2[1][1] >= max)
          ) {
            ret = true;
          }
        }
      }
    }
    return ret;
  }

  private correctLinearEquation(
    gameData: GameData,
    engine: Physics,
    room: GameRoom,
  ): GameData {
    if (gameData.gamePhase === GamePhase.HIT_THE_WALL) {
      gameData.anglePos[1] *= -1;
      gameData.standardPos[0] = gameData.currentPos[0].valueOf();
      gameData.standardPos[1] = gameData.currentPos[1].valueOf();
      gameData.standardPos[0] += gameData.anglePos[0].valueOf();
      gameData.standardPos[1] += gameData.anglePos[1].valueOf();
      if (
        gameData.vector === Vector.UPLEFT ||
        gameData.vector === Vector.UPRIGHT
      ) {
        gameData.vector += 2;
      } else if (
        gameData.vector === Vector.DOWNLEFT ||
        gameData.vector === Vector.DOWNRIGHT
      ) {
        gameData.vector -= 2;
      }
    } else if (gameData.gamePhase === GamePhase.HIT_THE_PADDLE) {
      gameData.standardPos[0] = gameData.currentPos[0].valueOf();
      gameData.standardPos[1] = gameData.currentPos[1].valueOf();
      if (
        gameData.vector === Vector.UPLEFT ||
        gameData.vector === Vector.DOWNLEFT
      ) {
        if (
          gameData.paddle1[0] - 10 > gameData.currentPos[1] ||
          gameData.paddle1[0] + 10 < gameData.currentPos[1]
        )
          gameData.anglePos = engine.changeAngleForPaddle(gameData, room);
        else {
          gameData.anglePos[0] *= -1;
        }
        gameData.vector += 1;
        // TODO: angle 보정치 전달
      } else if (
        gameData.vector === Vector.UPRIGHT ||
        gameData.vector === Vector.DOWNRIGHT
      ) {
        if (
          gameData.paddle2[0] - 10 > gameData.currentPos[1] ||
          gameData.paddle2[0] + 10 < gameData.currentPos[1]
        )
          gameData.anglePos = engine.changeAngleForPaddle(gameData, room);
        else {
          gameData.anglePos[0] *= -1;
        }
        gameData.vector -= 1;
      }

      // 바뀐 벡터 기준에서 새로운 각도를 추가한다.
      gameData.standardPos[0] += gameData.anglePos[0].valueOf();
      gameData.standardPos[1] += gameData.anglePos[1].valueOf();
    }
    gameData.linearEquation[0] =
      (gameData.standardPos[1] - gameData.currentPos[1]) /
      (gameData.standardPos[0] - gameData.currentPos[0]);
    gameData.linearEquation[1] =
      gameData.standardPos[1] -
      gameData.linearEquation[0] * gameData.currentPos[0];
    return gameData;
  }

  public getRandomInt(min: number, max: number): number {
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    if (randomValue == 0) randomValue = 1;
    return randomValue;
  }

  private changeAngleForPaddle(
    gameData: GameData,
    room: GameRoom,
  ): [number, number] {
    let a;
    let b;
    switch (gameData.vector) {
      case Vector.UPRIGHT:
        a = this.getRandomInt(-5, -1);
        b = this.getRandomInt(-5, -1);
        if (this.getRandomInt(1, 3) === 3)
          room.animation.bonusSetUnitDistance(10);
        return [a, b];
      case Vector.UPLEFT:
        a = this.getRandomInt(1, 5);
        b = this.getRandomInt(-5, -1);
        if (this.getRandomInt(1, 3) === 3)
          room.animation.bonusSetUnitDistance(10);
        return [a, b];
      case Vector.DOWNRIGHT:
        a = this.getRandomInt(-5, -1);
        b = this.getRandomInt(1, 5);
        if (this.getRandomInt(1, 3) === 3)
          room.animation.bonusSetUnitDistance(10);
        return [a, b];
      case Vector.DOWNLEFT:
        a = this.getRandomInt(1, 5);
        b = this.getRandomInt(1, 5);
        if (this.getRandomInt(1, 3) === 3)
          room.animation.bonusSetUnitDistance(10);
        return [a, b];
    }
  }

  private checkGameScore(gameData: GameData, engine: Physics): GameData {
    if (
      gameData.vector === Vector.UPLEFT ||
      gameData.vector === Vector.DOWNLEFT
    ) {
      if (gameData.currentPos[0] - 20 === engine.MIN_WIDTH) {
        gameData.score[1]++;
        gameData.gamePhase = GamePhase.HIT_THE_GOAL_POST;
      }
    } else {
      if (gameData.currentPos[0] + 20 === engine.MAX_WIDTH) {
        gameData.score[0]++;
        gameData.gamePhase = GamePhase.HIT_THE_GOAL_POST;
      }
    }
    return gameData;
  }

  private correctPaddleDatas(
    paddle: [number, [number, number]],
    engine: Physics,
  ): [number, [number, number]] {
    if (paddle[0] > 0) {
      if (paddle[0] >= engine.MAX_HEIGHT - 40) {
        paddle[1][0] = engine.MAX_HEIGHT - 80;
        paddle[0] = engine.MAX_HEIGHT - 40;
        paddle[1][1] = engine.MAX_HEIGHT;
      }
    } else if (paddle[0] < 0) {
      if (paddle[0] <= engine.MIN_HEIGTH + 40) {
        paddle[1][0] = engine.MIN_HEIGTH;
        paddle[0] = engine.MIN_HEIGTH + 40;
        paddle[1][1] = engine.MIN_HEIGTH + 80;
      }
    }
    return paddle;
  }

  private checkHitTheWall(
    ballData: [number, number],
    vector: Vector,
    engine: Physics,
  ): boolean {
    let ret: boolean;
    ret = false;
    if (vector === Vector.DOWNLEFT || vector === Vector.DOWNRIGHT) {
      if (ballData[1] + 20 >= engine.MAX_HEIGHT) {
        ballData[1] = engine.MAX_HEIGHT - 20;
        ret = true;
      }
    } else if (vector === Vector.UPLEFT || vector === Vector.UPRIGHT) {
      if (ballData[1] <= engine.MIN_HEIGTH) {
        ballData[1] = engine.MIN_HEIGTH + 20;
        ret = true;
      }
    }
    return ret;
  }

  private checkHitThePaddle(
    ballData: [number, number],
    vector: Vector,
    engine: Physics,
  ): boolean {
    let ret: boolean;
    ret = false;
    if (vector === Vector.DOWNLEFT || vector === Vector.UPLEFT) {
      if (ballData[0] - 20 <= engine.PADDLE_LINE_1) {
        ret = true;
      }
    } else if (vector === Vector.DOWNRIGHT || vector === Vector.UPRIGHT) {
      if (ballData[0] + 20 >= engine.PADDLE_LINE_2) {
        ret = true;
      }
    }
    return ret;
  }
  private checkHitTheGoalPost(
    ballData: [number, number],
    vector: Vector,
    engine: Physics,
    gameData: GameData,
  ): boolean {
    let ret: boolean;
    ret = false;
    if (vector === Vector.DOWNLEFT || vector === Vector.UPLEFT) {
      if (ballData[0] - 20 > engine.MIN_WIDTH) {
        ret = false;
      } else if (ballData[0] - 20 <= engine.MIN_WIDTH) {
        gameData.score[1]++;
        ret = true;
      }
    } else if (vector === Vector.DOWNRIGHT || vector === Vector.UPRIGHT) {
      if (ballData[0] + 20 < engine.MAX_WIDTH) {
        ret = false;
      } else if (ballData[0] + 20 >= engine.MAX_WIDTH) {
        gameData.score[0]++;
        ret = true;
      }
    }
    if (ret === true) gameData.gamePhase = GamePhase.HIT_THE_GOAL_POST;
    return ret;
  }
}
