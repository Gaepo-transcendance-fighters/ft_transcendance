import { GameRecord } from 'src/entity/gameRecord.entity';
import { GameStatus } from '../enum/game.type.enum';
import { UserObject } from 'src/entity/users.entity';
import { GamePlayer } from '../class/game.player/game.player';

export class GameScoreFinshDto {
  userIdx1: number;
  userScore1: number;
  userIdx2: number;
  userScore2: number;
  issueDate: number;
  gameStatus: GameStatus;
  winner: number;
  constructor(
    user1: GamePlayer,
    user2: GamePlayer,
    status: GameStatus,
    winner: number,
  ) {
    this.userIdx1 = user1.userIdx;
    this.userIdx2 = user2.userIdx;
    this.userScore1 = user1.score;
    this.userScore2 = user2.score;
    this.gameStatus = status;
    this.winner = winner;
  }
}
