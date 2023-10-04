import { GameData } from '../enum/game.data.enum';
import { GameStatus } from '../enum/game.type.enum';
import { GamePlayer } from '../class/game.player/game.player';

export class GamePauseScoreDto {
  userIdx1: number;
  userScore1: number;
  userIdx2: number;
  userScore2: number;
  issueDate: number;
  gameStatus: GameStatus;
  winnerIdx: number | null;

  constructor(
    users: GamePlayer[],
    data: GameData,
    status: GameStatus,
    winner: number | null,
  ) {
    this.userIdx1 = users[0].getUserObject().userIdx;
    this.userScore1 = data.score[0];
    this.userIdx2 = users[1].getUserObject().userIdx;
    this.userScore2 = data.score[1];
    this.issueDate = Date.now();
    this.gameStatus = status;
    this.winnerIdx = winner;
  }
}
