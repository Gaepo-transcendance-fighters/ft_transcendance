import { Injectable } from '@nestjs/common';
import { GameRecordRepository } from './game.record.repository';
import { GameChannelRepository } from './game.channel.repository';
import { GameRoom } from './class/game.room/game.room';
import { GameWaitQueue } from './class/game.wait.queue/game.wait.queue';
import { GameQueue } from './class/game.queue/game.queue';
import { GameOnlineMember } from './class/game.online.member/game.online.member';
import { UserObjectRepository } from 'src/users/users.repository';
import { GamePlayer } from './class/game.player/game.player';
import { GameOptions } from './class/game.options/game.options';
import {
  GameType,
  GameSpeed,
  MapNumber,
  RecordType,
  RecordResult,
  GameStatus,
} from './enum/game.type.enum';
import { GameSmallOptionDto } from './dto/game.options.small.dto';
import { Server } from 'socket.io';
import { GameServerTimeDto } from './dto/game.server.time.dto';
import { GameFinalReadyDto } from './dto/game.final.ready.dto';
import { GameStartDto } from './dto/game.start.dto';
import { GamePaddleMoveDto } from './dto/game.paddle.move.dto';
import { GamePaddlePassDto } from './dto/game.paddle.pass.dto';
import { GameScoreDto } from './dto/game.score.dto';
import { GameScoreFinshDto } from './dto/game.score.finish.dto';
import { GameBall } from './class/game.ball/game.ball';
import { GameBallEventDto } from './dto/game.ball.event.dto';
import { GameRecord } from 'src/entity/gameRecord.entity';
import { GameChannel } from 'src/entity/gameChannel.entity';
import { OnlineStatus } from 'src/entity/users.entity';
import { GameInviteQueue } from './class/game.invite.queue/game.invite.queue';
import { GameFriendMatchDto } from './dto/game.friend.match.dto';
import { GameOptionDto } from './dto/game.option.dto';

type WaitPlayerTuple = [GamePlayer, GameOptions];

@Injectable()
export class GameService {
  private playRoomList: GameRoom[];
  private normalQueue: GameQueue;
  private rankQueue: GameQueue;
  private inviteQueue: GameInviteQueue;
  private waitingList: GameWaitQueue;
  private onlinePlayerList: GameOnlineMember[];
  private cnt: number;

  constructor(
    private gameRecordRepository: GameRecordRepository,
    private gameChannelRepository: GameChannelRepository,
    private userObjectRepository: UserObjectRepository,
  ) {
    this.playRoomList = [];
    this.onlinePlayerList = [];
    this.waitingList = new GameWaitQueue();
    this.normalQueue = new GameQueue();
    this.rankQueue = new GameQueue();
    this.inviteQueue = new GameInviteQueue();
    this.cnt = 0;
  }
  /**
   * 전체 비즈니스 로직 인스턴스를 점검하는 함수
   * @param msg
   */
  public async checkStatus(msg: string) {
    console.log(msg);
    console.log(`PlayRoom List : ${this.playRoomList.length}`);
    for (let i = 0; i < this.playRoomList.length; i++) {
      console.log(`Room [${i}]`);
      await console.log(
        `play room List : ${this.playRoomList[i].user1.userObject.nickname}`,
      );
      await console.log(
        `play room List : ${this.playRoomList[i].user2.userObject.nickname}`,
      );
    }
    console.log(`Normal Queue List : ${this.normalQueue.size()}`);
    for (let i = 0; i < this.normalQueue.size(); i++) {
      await console.log(
        `normal Queue ${this.normalQueue.queueData[i][0].userObject.nickname}`,
      );
    }
    console.log(`Rank Queue List : ${this.rankQueue.size()}`);
    for (let i = 0; i < this.rankQueue.size(); i++) {
      await console.log(
        `rank Queue ${this.rankQueue.queueData[i][0].userObject.nickname}`,
      );
    }
    console.log(`Waiting List : ${this.waitingList.size()}`);
    for (let i = 0; i < this.waitingList.size(); i++) {
      await console.log(
        `normal Queue ${this.waitingList.waitPlayers[i][0].userObject.nickname}`,
      );
    }
    console.log(`Player List : ${this.onlinePlayerList.length}`);
    for (let i = 0; i < this.onlinePlayerList.length; i++) {
      console.log(`online List ${this.onlinePlayerList[i].user.nickname}`);
    }
    console.log(`${msg} is end`);
  }

  /**
   * 지정된 큐에서 GameUser를 지운다
   * @param userIdx
   * @param queue
   */
  private deleteUserFromQueue(userIdx: number, queue: GameQueue) {
    for (let i = 0; i < queue.size(); i++) {
      if (queue.queueData[i][0].userIdx === userIdx) {
        queue.queueData.splice(i, 1);
      }
    }
  }

  /**
   * OnlineList에 포함된 player를 발견한다.
   * @param userIdx
   * @returns
   */
  private findPlayerFromList(userIdx: number): number {
    for (let index = 0; index < this.onlinePlayerList.length; index++) {
      if (this.onlinePlayerList[index].user.userIdx == userIdx) return index;
    }
    return -1;
  }

  /**
   * UserObject에서 idx와 socket 정보를 합쳐 GamePlayer 객체 생성용
   * @param userIdx
   * @returns
   */
  private makeGamePlayer(userIdx: number): GamePlayer | null {
    const index = this.findPlayerFromList(userIdx);
    if (index == -1) {
      //TODO: error handling
    }
    const user = this.onlinePlayerList[index];
    // console.log(`makeGamePlayer : ${user.user.nickname}`);
    const returnPlayer = new GamePlayer(userIdx, user.user, user.userSocket);
    // console.log(`makeGamePlayer 2: ${returnPlayer.userObject.nickname}`);
    return returnPlayer;
  }

  /**
   * RoomId를 만들기 위한 메소드
   * @returns
   */
  public makeRoomId(): string {
    const target = 'game_room_'.concat(this.cnt.toString());
    this.cnt++;
    return target;
  }

  /**
   * waiting list에 담겨진 길이를 반환한다.
   * @returns
   */
  public sizeWaitPlayer(): number {
    // console.log(`sizeWaitPlayer: ${this.waitingList.size()}`);
    return this.waitingList.size();
  }

  /**
   * 지정한 큐에 집어 넣음으로써 매칭 될 수 있도록 만들어준다. 2명이 큐에 들어가면 매칭이 성사된다.
   * @param userIdx
   * @returns
   */
  public async putInQueue(userIdx: number): Promise<Promise<number | null>> {
    const playerTuple: WaitPlayerTuple = this.waitingList.popPlayer(userIdx);
    // console.log(playerTuple[0].userIdx);
    // console.log(playerTuple[0].userObject.nickname);
    // console.log(playerTuple[1].getType());
    // const value = playerTuple[1].getType();
    let returnValue;
    returnValue = 0;
    console.log(playerTuple[1].getType() == GameType.RANK ? true : false);
    console.log(GameType.RANK);
    switch (playerTuple[1].getType()) {
      case GameType.FRIEND:
        break;
      case GameType.NORMAL:
        console.log('Normal is here');
        this.normalQueue.Enqueue(playerTuple);
        if (this.normalQueue.size() >= 2) {
          const playerList: WaitPlayerTuple[] | null =
            this.normalQueue.DequeueList();
          const roomId = this.makeRoomId();
          const gameRoom = new GameRoom(roomId);
          gameRoom.setUser(playerList[0][0], playerList[0][1]);
          gameRoom.setUser(playerList[1][0], playerList[1][1]);
          returnValue = this.playRoomList.length;
          this.playRoomList.push(gameRoom);
          return returnValue;
        }
        break;
      case GameType.RANK:
        console.log('Rank is here');
        this.rankQueue.Enqueue(playerTuple);
        if (this.rankQueue.size() >= 2) {
          console.log('Rank is here2');
          const playerList: WaitPlayerTuple[] | null =
            this.rankQueue.DequeueList();
          //   console.log(`player queue ${playerList.length}`);
          const roomId = this.makeRoomId();
          //   console.log(`room ID : ${roomId}`);

          const gameRoom = new GameRoom(roomId);
          // console.log(`room ID : ${roomId}`);
          await gameRoom.setUser(playerList[0][0], playerList[0][1]);
          // console.log(
          //   `player 1 Ready : ${playerList[0][0].userObject.nickname}`,
          // );
          await gameRoom.setUser(playerList[1][0], playerList[1][1]);
          // console.log(
          //   `player 2 Ready : ${playerList[1][0].userObject.nickname}`,
          // );

          returnValue = this.playRoomList.length;
          this.playRoomList.push(gameRoom);
          console.log(returnValue);

          return returnValue;
        }
        break;
      default:
        return -1;
    }
    return null;
  }

  /**
   * 게임룸의 내용을 DB에 저장한다.
   * @param roomNumber
   */
  public async setRoomToDB(roomNumber: number) {
    const target = this.playRoomList[roomNumber];
    let type;
    if (target.option.getType() == GameType.RANK) {
      type = RecordType.RANK;
    } else type = RecordType.NORMAL;

    const room = this.gameChannelRepository.create({
      type: type,
      userIdx1: target.user1.userIdx,
      userIdx2: target.user2.userIdx,
      score1: 0,
      score2: 0,
      status: RecordResult.DEFAULT,
    });
    target.setChannelObject(room);
    await this.gameChannelRepository.save(room);
    const gameIdx = room.gameIdx;
    console.log(gameIdx);
    const record1 = await this.gameRecordRepository.create({
      gameIdx: gameIdx,
      userIdx: target.user1.userIdx,
      matchUserNickname: target.user2.userObject.nickname,
      matchUserIdx: target.user2.userIdx,
      type: type,
      result: RecordResult.DEFAULT,
      score: '',
      matchDate: new Date(),
    });
    const record2 = await this.gameRecordRepository.create({
      gameIdx: gameIdx,
      userIdx: target.user2.userIdx,
      matchUserNickname: target.user1.userObject.nickname,
      matchUserIdx: target.user1.userIdx,
      type: type,
      result: RecordResult.DEFAULT,
      score: '',
      matchDate: record1.matchDate,
    });

    target.setChannelObject(room);
    target.setRecordObject(record1);
    target.setRecordObject(record2);

    await this.gameRecordRepository.save(record1);
    await this.gameRecordRepository.save(record2);
    console.log('DB 저장 성공');
  }

  /**
   * RoomNumber로 Room 객체를 받아낸다.
   * @param roomNumber
   * @returns
   */
  public getRoomByRoomNumber(roomNumber: number): GameRoom {
    return this.playRoomList[roomNumber];
  }

  /**
   * userIdx를 통해 Room 객체를 호출한다.
   * @param userIdx
   * @returns
   */
  public getRoomByUserIdx(userIdx: number): GameRoom | null {
    for (const room of this.playRoomList) {
      if (room.user1.userIdx === userIdx || room.user2.userIdx === userIdx)
        return room;
    }
    return null;
  }

  /**
   * roomId를 통해 Room 객체를 호출한다.
   * @param roomId
   * @returns
   */
  public getRoomByRoomId(roomId: string): GameRoom | null {
    for (const room of this.playRoomList) {
      if (room.roomId == roomId) {
        return room;
      }
    }
    return null;
  }

  /**
   * Latency 를 비교하고, 가장 큰 쪽으로 레이턴시를 설정한다.
   * @param userIdx
   * @param roomId
   * @param latency
   * @returns
   */
  public setLatency(userIdx: number, roomId: string, latency: number): boolean {
    for (const room of this.playRoomList) {
      if (room.roomId === roomId) {
        if (room.user1.userIdx === userIdx) room.user1.setLatency(latency);
        else room.user2.setLatency(latency);
        if (room.user1.getLatency() != -1 && room.user2.getLatency() != -1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 최초 비즈니스 로직. 룸 생성 이후, 방에 player를 Join 하고 확정된 옵션을 반환한다.
   * @param roomNumber
   * @param server
   * @returns
   */
  public getReadyFirst(roomNumber: number, server: Server): boolean {
    const target = this.getRoomByRoomNumber(roomNumber);
    target.user1.socket.join(target.roomId);
    target.user2.socket.join(target.roomId);
    const finalOptions = new GameSmallOptionDto(
      target.option.getType(),
      target.option.getSpeed(),
      target.option.getMapNumber(),
    );
    return server.to(target.roomId).emit('game_ready_first', finalOptions);
  }

  /**
   * 레이턴시를 측정하기 위한 용도
   * @param roomNumber
   * @param server
   * @returns
   */
  public getReadySecond(roomNumber: number, server: Server): boolean {
    const target = this.getRoomByRoomNumber(roomNumber);
    const serverDateTime = new GameServerTimeDto(target.roomId, Date.now());
    return server.to(target.roomId).emit('game_ready_second', serverDateTime);
  }

  /**
   * 게임 시작 전 최종 정리 로직
   * @param userIdx
   * @param server
   * @returns
   */
  public getReadyFinal(userIdx: number, server: Server): boolean {
    const target = this.getRoomByUserIdx(userIdx);
    const finalReady = new GameFinalReadyDto(target);
    server.to(target.roomId).emit('game_ready_final', finalReady);

    return this.startPong(target, server);
  }

  /**
   * 최초 경로와 함께 게임 시작 메소드
   * @param targetRoom
   * @param server
   * @returns
   */
  public startPong(targetRoom: GameRoom, server: Server): boolean {
    let latency = 0;
    if (targetRoom.user1.getLatency() > targetRoom.user2.getLatency())
      latency = targetRoom.user1.getLatency();
    else latency = targetRoom.user2.getLatency();
    const ballExpectedEventDate = new Date();
    const startBall = new GameStartDto(
      Date.now() + latency,
      ballExpectedEventDate.getTime(),
      targetRoom.ballList[0],
    );
    return server.to(targetRoom.roomId).emit('game_start', startBall);
  }

  /**
   * player를 waiting List 에 직접 집어넣는다.
   * @param userIdx
   * @param options
   * @returns
   */
  public setWaitPlayer(userIdx: number, options: GameOptions): number {
    // console.log('here?');
    const player = this.makeGamePlayer(userIdx);
    // console.log(`setWaitPlayer Test ${player.userObject.nickname}`);
    return this.waitingList.pushPlayer(player, options);
  }

  /**
   * 유저를 온라인 된 대상으로 넘긴다.
   * @param player
   * @returns
   */
  public async pushOnlineUser(player: GameOnlineMember): Promise<number> {
    const index = this.findPlayerFromList(player.user.userIdx);

    if (index != -1) return -1;

    if (player.user.isOnline == OnlineStatus.OFFLINE)
      player.user.isOnline = OnlineStatus.ONGAME;
    await this.userObjectRepository.save(player.user);
    this.onlinePlayerList.push(player);
    // console.log(this.onlinePlayerList[index].user.nickname);
    return this.onlinePlayerList.length;
  }

  /**
   * 온라인 리스트에 올라온 유저를 offline으로 처리한다.
   * @param userIdx
   * @returns
   */
  public async popOnlineUser(userIdx: number): Promise<number> {
    const index = this.findPlayerFromList(userIdx);

    if (index == -1) return this.onlinePlayerList.length;

    this.onlinePlayerList[index].user.isOnline = OnlineStatus.OFFLINE;
    await this.userObjectRepository.save(this.onlinePlayerList[index].user);
    this.onlinePlayerList.splice(index, 1);

    return this.onlinePlayerList.length;
  }

  /**
   * 모든 리스트에서 해당 userId가 있다면, 제거하고, 온라인 목록에서 제거한다.
   * @param userIdx
   */
  public async deleteUserFromAllList(userIdx: number) {
    this.deleteUserFromQueue(userIdx, this.normalQueue);
    this.deleteUserFromQueue(userIdx, this.rankQueue);
    this.deleteRoom(userIdx);
    await this.popOnlineUser(userIdx);
  }

  public deleteRoom(userIdx: number) {
    const room = this.getRoomByUserIdx(userIdx);
    const index = this.getRoomIdxWithRoom(room);
    if (index === -1) return;
    this.playRoomList.splice(index, 1);
    return;
  }

  /**
   * 패들 움직임을 상대방에게 전달한다.
   * @param paddleMove
   * @param time
   * @returns
   */
  public async movePaddle(
    paddleMove: GamePaddleMoveDto,
    time: number,
  ): Promise<number> {
    const { userIdx, clientDate, paddleInput } = paddleMove;
    const latency = time - clientDate;
    const targetRoom = this.getRoomByUserIdx(userIdx);
    let target: GamePlayer;
    let nonTarget: GamePlayer;
    if (targetRoom.user1.userIdx === userIdx) {
      target = targetRoom.user1;
      nonTarget = targetRoom.user2;
    } else {
      target = targetRoom.user2;
      nonTarget = targetRoom.user1;
    }
    await target.socket.emit(
      'game_move_paddle',
      new GamePaddlePassDto(latency, paddleInput),
    );
    nonTarget.setLatency(latency);

    // play Room 찾기
    // 상대방 찾기
    // 레이턴 계산하기
    // 상대 전달하기

    return latency;
  }

  /**
   * 스코어 데이터가 양쪽에서 정상적으로 수신 되는지를 파악하는 용도의 메소드다.
   * @param datas
   * @returns
   */
  private checkScoreData(datas: GameScoreDto[]): boolean {
    if (datas[0].userIdx !== datas[1].userIdx) return false;
    if (datas[0].score !== datas[1].score) return false;
    return true;
  }

  /**
   * Room 객체를 통해 Room의 현재 인덱싱 위치를 반환한다.
   * @param targetRoom
   * @returns
   */
  public getRoomIdxWithRoom(targetRoom: GameRoom): number {
    let index = 0;

    for (const room of this.playRoomList) {
      if (
        room.user1.userIdx == targetRoom.user1.userIdx &&
        room.user2.userIdx == targetRoom.user2.userIdx
      )
        return index;
      index++;
    }

    return -1;
  }

  /**
   * 5점을 달성 했을 때, 스코어를 포함 처리를 위한 메소드
   * @param user1
   * @param user2
   * @param room
   * @param server
   */
  private async winnerScoreHandling(
    user1: GamePlayer,
    user2: GamePlayer,
    room: GameRoom,
    server: Server,
  ) {
    await this.gameChannelRepository.save(
      room.saveChannelObject(user1.score, user2.score, RecordResult.DONE),
    );
    const records = room.saveRecordObject(
      user1.score,
      user2.score,
      RecordResult.WIN,
      RecordResult.LOSE,
    );

    await this.gameRecordRepository.save(records[0]).then(async () => {
      await this.gameRecordRepository.save(records[1]);
    });

    if (room.getChannelObject().type == RecordType.RANK) {
      user1.userObject.rankpoint += 10;
      user1.userObject.win++;
      user2.userObject.rankpoint -= 10;
      user2.userObject.lose++;
      await this.userObjectRepository.save(user1.userObject).then(async () => {
        await this.userObjectRepository.save(user2.userObject);
      });
    }

    const finishData = new GameScoreFinshDto(
      user1,
      user2,
      GameStatus.TERMINATION,
      user1.userIdx,
    );
    const targetIdx = this.getRoomIdxWithRoom(room);

    await server.to(room.roomId).emit('game_get_score', finishData);
    user1.socket.leave(room.roomId);
    user2.socket.leave(room.roomId);
    this.playRoomList.splice(targetIdx, 1);
    this.popOnlineUser(user1.userIdx);
    this.popOnlineUser(user2.userIdx);
    user1.socket.disconnect(true);
    user2.socket.disconnect(true);
  }

  /**
   * 득점을 했을 때, 스코어를 포함 처리를 위한 메소드
   * @param user1
   * @param user2
   * @param room
   * @param server
   */
  private async scoreHandling(
    user1: GamePlayer,
    user2: GamePlayer,
    room: GameRoom,
    server: Server,
  ) {
    await this.gameChannelRepository.save(
      room.saveChannelObject(user1.score, user2.score, RecordResult.PLAYING),
    );
    const records = room.saveRecordObject(
      user1.score,
      user2.score,
      RecordResult.PLAYING,
      RecordResult.PLAYING,
    );
    await this.gameRecordRepository.save(records[0]).then(async () => {
      await this.gameRecordRepository.save(records[1]);
    });

    const finishData = new GameScoreFinshDto(
      user1,
      user2,
      GameStatus.ONGOING,
      0,
    );
    await server.to(room.roomId).emit('game_get_score', finishData);
    room.predictBallCourse();
    await this.startPong(room, server);
  }

  /**
   * 스코어에 대한 처리를 위한 로직
   * @param scoreData
   * @param server
   */
  public async handleScore(scoreData: GameScoreDto, server: Server) {
    const userIdx = scoreData.userIdx;
    const targetRoom = this.getRoomByUserIdx(userIdx);
    if (targetRoom.setScoreData(scoreData)) {
      const datas = targetRoom.getScoreDataList();
      if (this.checkScoreData(datas)) {
        if (targetRoom.user1.userIdx === datas[0].userIdx) {
          targetRoom.user1.score = datas[0].score;
          if (datas[0].score === 5) {
            await this.winnerScoreHandling(
              targetRoom.user1,
              targetRoom.user2,
              targetRoom,
              server,
            );
            // DB 저장
            // API 13
            // 게임 종료 및 방 정리
          } else {
            await this.scoreHandling(
              targetRoom.user1,
              targetRoom.user2,
              targetRoom,
              server,
            );
            // DB 저장
            // 재시작 준비
          }
        } else {
          targetRoom.user2.score = datas[0].score;
          if (datas[0].score === 5) {
            await this.winnerScoreHandling(
              targetRoom.user2,
              targetRoom.user1,
              targetRoom,
              server,
            );
            // API 13
            // DB 저장
            // 게임 종료 및 방 정리
          } else {
            await this.scoreHandling(
              targetRoom.user2,
              targetRoom.user1,
              targetRoom,
              server,
            );
            // DB 저장
            // 재시작 준비
          }
        }
        targetRoom.deleteScoreData();
      } else {
        //TODO: error handling
      }
    }
  }

  /**
   * 다음 볼의 경로를 확인하고, 예측된 값을 계산해낸다.
   * @param ballEvent
   * @param server
   */
  public async nextBallEvent(ballEvent: GameBallEventDto, server: Server) {
    const targetRoom = this.getRoomByRoomId(ballEvent.roomId);
    if (targetRoom === null) {
      // TODO :  error handling
    }
    if (targetRoom.setEventData(ballEvent)) {
      const eventData = targetRoom.getEventDataList();
      if (
        eventData[0].ballPosX != eventData[1].ballPosX ||
        eventData[0].ballDegreeX != eventData[1].ballDegreeX
      ) {
        //TODO : event Error handling
      }
      targetRoom.deleteBallEvent();
      targetRoom.ballList.push(new GameBall(ballEvent));
      let latency = 0;
      if (targetRoom.user1.getLatency() > targetRoom.user2.getLatency())
        latency = targetRoom.user1.getLatency();
      else latency = targetRoom.user2.getLatency();
      targetRoom.deleteEventData();
      server
        .to(targetRoom.roomId)
        .emit(
          'game_predict_ball',
          new GameStartDto(
            Date.now() + latency,
            Date.now(),
            targetRoom.ballList[0],
          ),
        );
    }
    // 1. 공의 초기 값 입력, 각도 입력
    // 2. 공의 다음 경로 예측
    // 3.
  }

  public async checkOnGameOrNOT(userId: number, server: Server) {
    const room = this.getRoomByUserIdx(userId);
    if (!room) {
      return;
    }
    let winner;
    if (userId === room.user1.userIdx) {
      winner = room.user2.userIdx;
    } else {
      winner = room.user1.userIdx;
    }
    const finishData = new GameScoreFinshDto(
      room.user1,
      room.user2,
      GameStatus.JUDGEMENT,
      winner,
    );
    await server.to(room.roomId).emit('game_get_score', finishData);
    const recordList: GameRecord[] = room.getRecrodObject();
    const channelObject: GameChannel = room.getChannelObject();
    if (winner == room.user1.userIdx) {
      recordList[0].result = RecordResult.WIN;
      recordList[0].score = room.user1.score
        .toString()
        .concat(` : ${room.user2.score.toString()}`);
      recordList[1].result = RecordResult.LOSE;
      recordList[1].score = room.user2.score
        .toString()
        .concat(` : ${room.user1.score.toString()}`);
      if (channelObject.type == RecordType.RANK) {
        room.user1.userObject.rankpoint += 10;
        room.user1.userObject.win++;
        room.user2.userObject.rankpoint -= 10;
        room.user2.userObject.lose--;
      }
    } else {
      recordList[1].result = RecordResult.WIN;
      recordList[1].score = room.user1.score
        .toString()
        .concat(` : ${room.user1.score.toString()}`);
      recordList[0].result = RecordResult.LOSE;
      recordList[0].score = room.user2.score
        .toString()
        .concat(` : ${room.user2.score.toString()}`);
      if (channelObject.type == RecordType.RANK) {
        room.user2.userObject.rankpoint += 10;
        room.user2.userObject.win++;
        room.user1.userObject.rankpoint -= 10;
        room.user1.userObject.lose--;
        await this.userObjectRepository
          .save(room.user1.userObject)
          .then(async () => {
            await this.userObjectRepository.save(room.user2.userObject);
          });
      }
    }
    channelObject.score1 = room.user1.score;
    channelObject.score2 = room.user2.score;
    channelObject.status = RecordResult.DONE;
    await this.gameRecordRepository.save(recordList[0]).then(async () => {
      await this.gameRecordRepository.save(recordList[1]);
    });
    await this.gameChannelRepository.save(channelObject);

    this.deleteUserFromAllList(room.user1.userIdx);
    this.deleteUserFromAllList(room.user2.userIdx);
    room.user1.socket.leave(room.roomId);
    room.user2.socket.leave(room.roomId);
    this.playRoomList.splice(this.getRoomIdxWithRoom(room), 1);
    this.popOnlineUser(room.user1.userIdx);
    this.popOnlineUser(room.user2.userIdx);
    room.user1.socket.disconnect(true);
    room.user2.socket.disconnect(true);
  }

  public async prepareFriendMatch(matchList: GameFriendMatchDto) {
    const user1 = this.makeGamePlayer(matchList.userIdx);
    const user2 = this.makeGamePlayer(matchList.targetUserIdx);
    if (this.inviteQueue.Enqueue(user1, user2)) {
      const users = this.inviteQueue.Dequeue(user1, user2);
      const room = new GameRoom(this.makeRoomId());
      const roomNumber = this.playRoomList.push(room);
      console.log(`${user1.userIdx}, ${user2.userIdx}`);
      const optionDto = new GameOptionDto(GameType.FRIEND, user1.userIdx, 0, 0);
      const options = new GameOptions(optionDto);
      console.log(`방 이름은? : ${room.roomId}`);
      room.setUser(user1, options);
      room.setUser(user2, options);
      const msg = 'Friend match preparing is done!';
      user1.socket.emit('game_invite_finish', msg);
      user2.socket.emit('game_invite_finish', msg);
    }
    return;
  }



  // PROFILE_INFINITY
  async getGameRecordsByInfinity(userIdx: number, page: number) {
    const skip = (page - 1) * 3; // items per page fixed
    const records = await this.gameRecordRepository.find({
      where: { userIdx },
      order: { matchDate: 'DESC' },
      skip,
      take: 3,
    });

    return records;
  }
}
