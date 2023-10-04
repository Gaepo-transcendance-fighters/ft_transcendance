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
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsExceptionFilter } from 'src/ws.exception.filter';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';
import { AuthGuard } from 'src/auth/auth.guard';
import { GameBasicAnswerDto } from './dto/game.basic.answer.dto';
import { GamePingReceiveDto } from './dto/game.ping.dto';
import { GameStartDto } from './dto/game.start.dto';
import { KeyPressDto } from './dto/key.press.dto';
import { GamePhase } from './enum/game.phase';
import { PlayerPhase } from './class/game.player/game.player';

const front = process.env.FRONTEND;
@WebSocketGateway({
  namespace: 'game/playroom',
  cors: {
    origin: [
      'http://paulryu9309.ddns.net:3000',
      'http://localhost:3000',
      front,
    ],
  },
})
@UseFilters(new WsExceptionFilter())
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  messanger: LoggerWithRes = new LoggerWithRes('GameGateway');

  constructor(private readonly gameService: GameService) {}

  handleDisconnect(client: Socket) {
    const userIdx: number = parseInt(client.handshake.query.userId as string);
    if (userIdx === undefined) return;
    if (Number.isNaN(userIdx)) return;
    // console.log(`userIdx(disconnection) : ${userIdx}`);
    this.gameService.handleDisconnectUsers(userIdx, this.server);
    // if (this.gameService.getOnlineList().length === 0) {
    //   this.gameService.stopIntervalId();
    // }
    return;
  }

  handleConnection(client: Socket) {
    // console.log(`connection handler!!!`);
    const userIdx: number = parseInt(
      client.handshake.query.userId as string,
      10,
    );
    // console.log(`connection : ${userIdx}`);
    if (userIdx === undefined) {
      client.disconnect(true);
      return;
    }
    if (Number.isNaN(userIdx)) return;
    const target = this.gameService.getOnlinePlayer(userIdx);
    // console.log(`target ${target}`);
    // console.log(`connection undefined : ${userIdx}`);

    if (target === undefined) return;
    target.playerStatus = PlayerPhase.CONNECT_SOCKET;
    this.gameService.popOutProcessedUserIdx(userIdx); // 처리된 사용자지만, 새로이 들어왔다면 다시 빼고 관리 이루어짐

    if (!this.gameService.setSocketToPlayer(client, userIdx)) {
      this.messanger.logWithWarn(
        'handleConnection',
        'userIdx',
        `${userIdx}`,
        'not proper access',
      );
      client.disconnect(true);
      console.log(`connection failer : ${userIdx}`);

      return;
    }
    // console.log(`connection1 : ${userIdx}`);

    this.gameService.changeStatusForPlayer(userIdx);
    // console.log(`connection2 : ${userIdx}`);

    if (this.gameService.getOnlineList().length >= 2) {
      if (this.gameService.getIntervalId() !== null) {
        return;
      } else {
        this.gameService.setIntervalQueue(this.server);
      }
    }

    return this.messanger.setResponseMsg(200, 'room is setted');
  }

  afterInit() {
    this.messanger.logWithMessage('afterInit', 'GameGatway', 'Initialize!');
  }

  @SubscribeMessage('game_queue_success')
  getReadyForGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameBasicAnswerDto,
  ) {
    const userIdx = data.userIdx;
    // console.log(`gmae_queue_success : `, userIdx);
    const ret = this.gameService.checkReady(userIdx);
    if (ret === null) {
      //   // console.log(`error happens!`);
      client.disconnect(true);
    }
    //TODO: error handling
    else if (ret === true) {
      //   // console.log('game ready');
      const roomId = this.gameService.findGameRoomIdByUserId(userIdx);
      setTimeout(() => {
        this.gameService.readyToSendPing(roomId, this.server);
      }, 1200);
      this.gameService.uncheckReady(userIdx);
      return this.messanger.setResponseMsg(200, 'game is start soon!');
    }
    return this.messanger.setResponseMsg(201, 'game is ready');
  }

  @SubscribeMessage('game_ping_receive')
  async getUserPong(@MessageBody() data: GamePingReceiveDto) {
    const time = Date.now();
    const latency = (time - data.serverTime) / 2;
    const ret = this.gameService.receivePing(
      data.userIdx,
      latency,
      this.server,
    );
    if (ret === true) {
      const targetRoom = this.gameService.findGameRoomById(data.userIdx);
      targetRoom.users[0].playerStatus = PlayerPhase.ON_PLAYING;
      targetRoom.users[1].playerStatus = PlayerPhase.ON_PLAYING;
      targetRoom.intervalId = null;
      this.server
        .to(targetRoom.roomId)
        .emit('game_start', new GameStartDto(targetRoom));
      targetRoom.setGamePhase(GamePhase.SET_NEW_GAME);
      setTimeout(() => {
        this.gameService.startGame(data.userIdx, this.server, this.gameService);
      }, 5000);
      return this.messanger.setResponseMsg(
        this.gameService.sendSetFrameRate(data.userIdx, this.server),
        'Your max fps is checked',
      );
    } else if (ret === -1) {
      return this.messanger.setResponseMsg(400, 'latency too high');
    } else
      return this.messanger.setResponseMsg(
        200,
        'pong is received successfully',
      );
  }

  @SubscribeMessage('game_move_paddle')
  getKeyPressData(@MessageBody() data: KeyPressDto) {
    const targetRoom = this.gameService.findGameRoomById(data.userIdx);
    // // console.log(`key board signal = ${data.userIdx} : ${data.paddle}`);
    targetRoom.keyPressed(data.userIdx, data.paddle);
    if (this.gameService.checkLatencyOnPlay(targetRoom, data, this.server)) {
      return this.messanger.setResponseMsg(202, 'Frame is changed');
    } else return this.messanger.setResponseMsg(202, 'Frame is changed');
  }

  @SubscribeMessage('game_pause_score')
  getPauseStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameBasicAnswerDto,
  ) {
    const userIdx = data.userIdx;
    const ret = this.gameService.checkReady(userIdx);
    if (ret === null) {
      return this.messanger.setResponseMsg(
        200,
        'please Wait. Both Player is ready',
      );
    }
    //TODO: error handling
    const target = this.gameService.findGameRoomById(userIdx);
    if (ret === null) client.disconnect(true);
    else if (
      ret === true &&
      target.gameObj.gamePhase === GamePhase.SET_NEW_GAME
    ) {
      const roomId = this.gameService.findGameRoomIdByUserId(userIdx);
      setTimeout(() => {
        this.gameService.readyToSendPing(roomId, this.server);
      }, 1200);
      this.gameService.uncheckReady(userIdx);
    } else if (
      ret === true &&
      target.gameObj.gamePhase === GamePhase.MATCH_END
    ) {
      this.gameService.uncheckReady(userIdx);
      const roomId = target.deleteRoom();
      this.gameService.deleteplayRoomByRoomId(roomId);
    }
    return this.messanger.setResponseMsg(
      200,
      'please Wait. Both Player is ready',
    );
  }

  @SubscribeMessage('game_force_quit')
  getQuitSignal(@MessageBody() data: GameBasicAnswerDto) {
    this.gameService.forceQuitMatch(data.userIdx, this.server);
  }

  @SubscribeMessage('game_queue_quit')
  quitQueue(@MessageBody() data: GameBasicAnswerDto) {
    const ret = this.gameService.pullOutQueuePlayerByUserId(data.userIdx);
    return this.messanger.setResponseMsg(
      200,
      'success to quit queue from list',
    );
  }
}
