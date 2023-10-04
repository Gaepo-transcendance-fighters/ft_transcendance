import { GamePhase } from './game.phase';
import { GameType, GameSpeed, MapNumber } from './game.type.enum';
import { Vector } from './game.vector.enum';
/**
 * 게임 구성요소를 나타내는 용도
 */
export interface GameData {
  // 현재 좌표 x, y
  currentPos: [number, number];
  // 각도 정보
  anglePos: [number, number];
  // 현재 좌표에 대해 각도를 더한 새로운 좌표(방정식용)
  standardPos: [number, number];
  // 최대 프레임, 현재 프레임
  frameData: [number, number];
  // 선형 방정식, 기울기, y 절편
  linearEquation: [number, number];
  // 방향 벡터
  vector: Vector;
  // 페들 정보 1, 중간 좌표, [상부, 하부]를 의미한다.
  paddle1: [number, [number, number]];
  // 페들 정보 2, 중간 좌표, [상부, 하부]를 의미한다.
  paddle2: [number, [number, number]];
  // 점수 튜플
  score: [number, number];
  // 게임 및 현재 상태를 표현하는 용도
  gamePhase: GamePhase;
  // 게임 속성
  gameType: GameType;
  // 게임 속도
  gameSpeed: GameSpeed;
  // 게임 맵 정보를 표현
  gameMapNumber: MapNumber;
}
