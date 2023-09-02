import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
// import { ReturnMsgDto } from './dto/error.message.dto';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/ws.exception.filter';
import { UsersService } from 'src/users/users.service';
import { GameOnlineMember } from './class/game.online.member/game.online.member';
import { GameOptionDto } from './dto/game.option.dto';
import { GameOptions } from './class/game.options/game.options';
import { GameRegiDto } from './dto/game.regi.dto';
import { GameLatencyGetDto } from './dto/game.latency.get.dto';
import { GameCancleDto } from './dto/game.cancle.dto';
import { GamePaddleMoveDto } from './dto/game.paddle.move.dto';
import { GameScoreDto } from './dto/game.score.dto';
import { GameBallEventDto } from './dto/game.ball.event.dto';
import { GameFriendMatchDto } from './dto/game.friend.match.dto';
import { GameType } from './enum/game.type.enum';
import {
  LoggerWithRes,
  ReturnMsgDto,
} from 'src/shared/class/shared.response.msg/shared.response.msg';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://paulryu9309.ddns.net:3000', 'http://localhost:3000'],
  },
})
@UseFilters(new WsExceptionFilter())
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  messanger: LoggerWithRes = new LoggerWithRes('GameGateway');

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) { }

  handleDisconnect(client: Socket) {
    const userId: number = parseInt(
      client.handshake.query.userId as string,
    );
    if (Number.isNaN(userId))
      return;
    this.gameService.checkOnGameOrNOT(userId, this.server);
    this.gameService.popOnlineUser(userId);
    // TODO: 작성해야 할 부분₩
    // 게임 중에 있는지 파악하기
    //	// 게임 중에 있을 시 판정 승으로 전달(api 는 승리와 동일하게 사용 가능)
    //	//	// DB 중에 관련 기록 탐색 (1. 게임 채널-> 2. 게임 레코드)
    //	//	//	// 내용 수정 및 정리
    // 게임 판정 승 로직 추가
    // 종료 시키기
  }

  async handleConnection(client: Socket) {
    const userId: number = parseInt(
      client.handshake.query.userId as string,
      10,
    );
    if (Number.isNaN(userId))
    return;
    const date = Date.now();
    // this.logger.log(`시작 일시 : ${date}`);
    // this.logger.log(userId + ' is connected');
    this.messanger.logWithMessage(
      'handleConnection',
      '',
      '',
      `${userId} is connected`,
    );
    const user = await this.usersService.getUserObjectFromDB(userId);
    // this.logger.log(user.nickname);
    const OnUser = new GameOnlineMember(user, client);
    // this.logger.log(OnUser.user.nickname);
    this.messanger.logWithMessage(
      'handleConnection',
      '',
      '',
      `${OnUser.user.nickname} is connected`,
    );
    this.gameService.pushOnlineUser(OnUser).then((data) => {
      if (data === -1) {
        client.disconnect(true);
        return;
      }
      //   this.logger.log('현재 접속 자 : ' + data);
    });
  }

  afterInit(server: any) {
    // this.logger.log('[ 🎮 Game ] Initialized!');
    this.messanger.logWithVerbose('🎮 Game', '', '', 'Initialized');
    // logging test
    this.messanger.logWithMessage(
      'constructor',
      '',
      '',
      '애플리케이션의 정상 동작 상황을 나타내는 로그에 사용됩니다. 주로 사용자의 행동, 요청 처리 또는 중요한 이벤트에 대한 정보를 기록하는데 사용합니다.',
    );
    this.messanger.logWithWarn(
      'constructor',
      '',
      '',
      '경고 메시지에 사용됩니다. 예상치 못한 상황이나 잠재적인 문제를 나타내며, 애플리케이션은 계속 작동하지만 주의해야 할 상황임을 알려줍니다.',
    );
    this.messanger.logWithError(
      'constructor',
      '',
      '',
      '오류 메시지에 사용됩니다. 장애 상황이나 처리할 수 없는 문제가 발생한 경우 사용되며, 애플리케이션이 예상대로 작동하지 않는 상황임을 나타냅니다.',
    );
    this.messanger.logWithDebug(
      'constructor',
      '',
      '',
      '디버깅 목적으로 사용됩니다. 개발 중에만 유용하며, 애플리케이션 내부의 상세 정보와 변수 값을 출력해 문제 해결에 도움을 줍니다.',
    );
    this.messanger.logWithVerbose(
      'constructor',
      '',
      '',
      '더 자세한 디버깅 정보를 제공하기 위해 사용됩니다. 일반적으로 debug보다 더 상세한 정보를 출력하며, 상세한 내부 동작을 추적하는 데 사용됩니다.',
    );
  }

  @SubscribeMessage('game_option')
  async sendGameOption(
    @ConnectedSocket() client: Socket,
    @MessageBody() options: GameOptionDto,
  ): Promise<ReturnMsgDto> {
    // await this.logger.log(`options is here : ${options.userIdx}`);
    const optionObject = new GameOptions(options);
    if (options.gameType !== GameType.FRIEND) {
      const condition = this.gameService.sizeWaitPlayer();
      const after = this.gameService.setWaitPlayer(
        options.userIdx,
        optionObject,
      );
      // this.gameService.checkStatus('game option start');
      if (after !== condition) {
        client.emit('game_option', options);
        return this.messanger.setResponseMsgWithLogger(
          200,
          'OK!',
          'game_option',
        );
      } else
        return this.messanger.setResponseMsgWithLogger(
          500,
          'Setting Error!',
          'game_option',
        );
    } else {
      this.messanger.logWithMessage('game_option', '', '', 'Friend Battle!');
      const userId = options.userIdx;
      const room = this.gameService.getRoomByUserIdx(userId);
      this.messanger.logWithMessage(
        'game_option',
        'room',
        `${room.roomId}`,
        'Friend set Room!',
      );
      if (room.setOptions(optionObject)) {
        this.messanger.logWithMessage('game_option', '', '', 'get in here?');

        const roomIdx = this.gameService.getRoomIdxWithRoom(room);
        // this.logger.log(`룸 작성 성공`);
        setTimeout(() => { this.gameService.getReadyFirst(roomIdx, this.server); }, 1000);
        setTimeout(() => { this.gameService.getReadySecond(roomIdx, this.server); }, 1000);
        try {
          await this.gameService.setRoomToDB(roomIdx);
        } catch (exception) {
          console.log(exception);
        }
        return this.messanger.setResponseMsgWithLogger(
          200,
          'OK!',
          'game_option',
        );
        // True -> 설정 완료
      }
      // false -> 설정 미완
      // 방 찾기
      // 옵션 설정
      // 성공시 다음으로 이동
      return this.messanger.setResponseMsgWithLogger(200, 'OK!', 'game_option');
      //   return this.messanger.setResponseMsg(200, 'OK!', 'game_option');
    }
  }

  @SubscribeMessage('game_queue_regist')
  async putInQueue(
    @MessageBody() regiData: GameRegiDto,
  ): Promise<ReturnMsgDto> {
    const { userIdx, queueDate } = regiData;
    this.gameService.checkStatus('game queue regist #1\n');
    // this.logger.log('여기까지 데이터 들어옴 : ', userIdx, queueDate);
    const roomNumber = await this.gameService.putInQueue(userIdx);
    this.gameService.checkStatus('\ngame queue regist #2');
    if (roomNumber == -1)
      return this.messanger.setResponseMsgWithLogger(
        400,
        'Bad Request',
        'game_queue_regist',
      );
    else if (roomNumber === null) {
      //   this.logger.log('대기상태');
      return this.messanger.setResponseMsgWithLogger(
        200,
        'Plz, Wait queue',
        'game_queue_regist',
      );
    } else if (roomNumber >= 0) {
      //   this.logger.log(`룸 작성 성공`);
      this.messanger.logWithMessage("game_queue_regist", "", "", `룸 제작 성공 : ${roomNumber}`)
      setTimeout(() => { this.gameService.getReadyFirst(roomNumber, this.server); }, 1000);
      setTimeout(() => { this.gameService.getReadySecond(roomNumber, this.server); }, 1000);
      try {
        await this.gameService.setRoomToDB(roomNumber);
      } catch (exception) {
        console.log(exception);
      }
      return this.messanger.setResponseMsgWithLogger(
        200,
        'OK!',
        'game_queue_regist',
      );
    }
    // this.logger.log(`user: ${userIdx} - regi date : ${queueDate}`);
    // 세팅 상태를 파악하고
    // 넣어야 할 큐에 집어 넣기
    // 2명 채워지면 game_queue_success
    //	//	룸 생성으로 조인 시키기
    //  // 게임 준비 1차 전달
    //	//	// 게임 준비 2차 전달
    // 아니면 대기 상태로 빠짐
  }

  //   @SubscribeMessage('game_queue_success')
  //   sendQueueSuccess(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_queue_quit')
  cancleQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() cancleUserIdx: GameCancleDto,
  ): ReturnMsgDto {
    const { userIdx } = cancleUserIdx;
    this.gameService.deleteUserFromAllList(userIdx).then(() => {
      client.disconnect(true);
    });
    this.gameService.checkStatus('connection cleaered?');

    // userIdx로 파악
    // 큐 안에 해당 대상 파악하기
    // 큐 안에 대상 삭제하기, 데이터 지우기
    // 해당 유저 커넥션 끊기
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK',
      'game_queue_quit',
    );
  }

  //   @SubscribeMessage('game_ready_first')
  //   readyFirstStep(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  //   @SubscribeMessage('game_ready_second')
  //   readySecondStep(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_ready_second_answer')
  async getLatency(
    @MessageBody() latencyData: GameLatencyGetDto,
  ): Promise<ReturnMsgDto> {
    const { userIdx, serverDateTime, clientDateTime } = latencyData;
    // this.logger.log(`second answer: ${userIdx}`);
    // this.messanger.logWithMessage('getLatency', `userIdx`, `${userIdx}`);
    const room = this.gameService.getRoomByUserIdx(userIdx);
    // this.logger.log(`second answer: ${room.roomId}`);
    // this.messanger.logWithMessage('getLatency', `roomId`, `${room.roomId}`);
    // this.messanger.logWithError('getLatency', `roomId`, `${room.roomId}`);
    if (room === null)
      return this.messanger.setResponseMsgWithLogger(
        400,
        'Bad Request',
        'game_ready_second_answer',
      );
    const latency = clientDateTime - serverDateTime;
    // this.logger.log(`second answer: ${latency}`);
    if (this.gameService.setLatency(userIdx, room.roomId, latency)) {
      this.gameService.getReadyFinal(userIdx, this.server);
    }

    // 내용 전달 받기
    // 레이턴시 작성 #1
    //	// 일단 저장후 대기
    // 레이턴시 작성 #2
    //	// game_ready_final로 최종 내용 전달
    //	//	// 레이턴시 고려한 게임 시작
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK!',
      'game_ready_second_answer',
    );
  }

  //   @SubscribeMessage('game_ready_final')
  //   sendFinalInfo(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  //   @SubscribeMessage('game_ready_start')
  //   startGame(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_predict_ball')
  async sendBallPrediction(
    @MessageBody() ballEvent: GameBallEventDto,
  ): Promise<ReturnMsgDto> {
    await this.gameService.nextBallEvent(ballEvent, this.server);
    // 공 부딪힌 시점 #1
    // 공 부딪힌 시점 #2
    //	// 공 예측 알고리즘으로 들어가기
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK!',
      'game_predict_ball',
    );
  }

  @SubscribeMessage('game_move_paddle')
  async sendPaddleToTarget(
    @MessageBody() paddleMove: GamePaddleMoveDto,
  ): Promise<ReturnMsgDto> {
    const time = Date.now();
    const selfLatency = await this.gameService.movePaddle(paddleMove, time);
    // 누군지 파악하기
    // 해당 룸 상대방 소켓으로 전달하기
    return this.messanger.setResponseMsgWithLogger(
      selfLatency,
      'check your latency',
      'game_move_paddle',
    );
  }

  @SubscribeMessage('game_pause_score')
  async pauseAndNextGame(
    @MessageBody() scoreData: GameScoreDto,
  ): Promise<ReturnMsgDto> {
    this.gameService.handleScore(scoreData, this.server);
    // 점수를 탄 내용 전달 받음 #1
    // 점수를 탄 내용 전달 받음 #2
    //	// 두개의 정보 판단 후
    //	//	// DB 저장 요청
    //	//	//	// 5점 득점 여부 판단
    //	//	//	//	// 아닐 경우 레이턴시 전달만 재 진행 (레이턴시 세컨드 엔서 api 로 간다)
    //	//	//	//	// 게임 종료 api 전달
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK',
      'game_pause_score',
    );
  }

  //   @SubscribeMessage('game_get_score')
  //   endMatch(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_invite_finish')
  prePareGameFormRiend(
    @MessageBody() matchList: GameFriendMatchDto,
  ): ReturnMsgDto {
    this.gameService.prepareFriendMatch(matchList);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK',
      'game_invite_final',
    );
  }

  @SubscribeMessage('game_switch_to_chat')
  exitGame(@ConnectedSocket() client: Socket): ReturnMsgDto {
    // DB 설정 변경 필요
    const userIdx = parseInt(client.handshake.query.userId as string);
    this.gameService.popOnlineUser(userIdx);
    //   .then((data) => this.logger.log(data));
    return this.messanger.setResponseMsgWithLogger(
      200,
      'OK',
      'game_switch_to_chat',
    );
  }
}
