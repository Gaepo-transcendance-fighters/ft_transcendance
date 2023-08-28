import { Controller, Get, Param, Query } from "@nestjs/common";
import { GameService } from "./game.service";
import { UsersService } from "src/users/users.service";
import { UserProfileGameRecordDto } from "./dto/game.record.dto";
import { RecordResult } from "./enum/game.type.enum";

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) { }

  // PROFILE_INIFINITY
  @Get('records')
  async getRecord(
    @Query('userIdx') userIdx: number,
    @Query('page') page: number,
  ) {
    console.log('getRecord', userIdx, page)
    const user = await this.usersService.findOneUser(userIdx);
    const records = await this.gameService.getGameRecordsByInfinity(userIdx, page);
    const userProfileGameRecordDto: UserProfileGameRecordDto = {
      userInfo: {
        win: user.win,
        lose: user.lose
      },
      gameList: records,
    }
    return userProfileGameRecordDto;
  }

/*

UserProfileGameRecordDto {
  userInfo : UserRecordInfoDto;
  gameList : GameRecord[];
}

UserRecordInfoDto {
  userNickname : string;
  win: number;
  lose: number;
}

*/
}