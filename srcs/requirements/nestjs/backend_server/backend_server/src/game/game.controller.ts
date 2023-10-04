import { Controller } from '@nestjs/common';
import { Get, Post, Query, Body, HttpStatus, Req, Res } from '@nestjs/common';
import { GameService } from './game.service';
import { UserProfileGameRecordDto } from './dto/game.record.dto';
import { GameOptionDto } from './dto/game.option.dto';
import { UsersService } from 'src/users/users.service';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';
import { GameInviteOptionDto } from './dto/game.invite.option.dto';
import { PlayerPhase } from './class/game.player/game.player';

@Controller('game')
export class GameController {
  messanger: LoggerWithRes = new LoggerWithRes('GameController');

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService, // private readonly inMemoryUsers: InMemoryUsers,
  ) {
    this.messanger.logWithMessage(
      'GameCostructor',
      'GameController',
      'Initialized!',
    );
  }

  // PROFILE_INIFINITY
  @Get('records')
  async getRecord(
    @Query('userIdx') userIdx: number,
    @Query('page') page: number,
  ) {
    // // console.log('getRecord', userIdx, page);
    const user = await this.usersService.findOneUser(userIdx);
    const records = await this.gameService.getGameRecordsByInfinity(
      userIdx,
      page,
    );
    const userProfileGameRecordDto: UserProfileGameRecordDto = {
      userInfo: {
        win: user.win,
        lose: user.lose,
        rankpoint: user.rankpoint,
      },
      gameRecord: records,
    };
    // // console.log('getRecord', userProfileGameRecordDto);
    return userProfileGameRecordDto;
  }

  @Post('normal-match')
  async postGameOptions(@Req() req, @Res() res, @Body() option: GameOptionDto) {
    // console.log('나 켜짐!! : 일반 게임');
    const message = '플레이어가 큐에 등록 되었습니다.';
    const errorMessage = '플레이어가 큐에 등록되지 못하였습니다.';
    let status: boolean;
    const target = await this.gameService.makePlayer(option);
    target.playerStatus = PlayerPhase.SET_OPTION;
    if (target === null) status = false;
    else {
      this.gameService.putInQueue(target, null);
      status = true;
    }
    // console.log(`option 찾자!!!!!`, option);
    if (status === false)
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(errorMessage);
    return res.status(HttpStatus.OK).json(message);
  }

  @Post('friend-match')
  async postInviteGameOptions(
    @Req() req,
    @Res() res,
    @Body() option: GameInviteOptionDto,
  ) {
    // console.log('나 켜짐!! : 친선 게임');
    const message = '친선전이 준비 되었습니다.';
    const errorMessage = '친선전이 실패하였습니다.';
    let status: boolean;
    const basicOption = new GameOptionDto(
      option.gameType,
      option.userIdx,
      option.speed,
      option.mapNumber,
    );
    const target = await this.gameService.makePlayer(basicOption);
    // console.log(`target check?! : ${target}`);
    if (target === null) status = false;
    else {
      target.playerStatus = PlayerPhase.SET_OPTION;
      //   console.log(
      //     `Friend Queue inserting! : ${target.getUserObject().nickname}`,
      //   );
      this.gameService.putInQueue(target, option);
      status = true;
    }
    if (status === false)
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(errorMessage);
    return res.status(HttpStatus.OK).json(message);
  }
}

@Controller('game-result')
export class GameResultController {
  messanger: LoggerWithRes = new LoggerWithRes('GameController');

  constructor(private readonly gameService: GameService) {
    this.messanger.logWithMessage(
      'GameCostructor',
      'GameController',
      'Initialized!',
    );
  }

  @Get()
  async getHistory(@Req() req, @Res() res, @Query('gameKey') gameKey: string) {
    // console.log(`game Key = ${gameKey}`);
    if (gameKey === undefined) return res.status(HttpStatus.BAD_REQUEST).json();
    const gIdx = parseInt(gameKey);
    const ret = await this.gameService.getHistoryByGameId(gIdx);
    if (ret === null) return res.status(HttpStatus.NOT_FOUND).json();
    return res.status(HttpStatus.OK).json(ret);
  }
}
