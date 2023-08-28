// TODO: try catch 로 에러 처리하기
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { Channel } from './class/chat.channel/channel.class';
import { Chat, MessageInfo } from './class/chat.chat/chat.class';
import { UsersService } from 'src/users/users.service';
import { DMChannel, Mode } from '../entity/chat.entity';
import { InMemoryUsers } from 'src/users/users.provider';
import { OnlineStatus, UserObject } from 'src/entity/users.entity';
import { SendDMDto } from './dto/send-dm.dto';
import { GameInvitationDto } from './dto/game.invitation.dto';
import { ReturnMsgDto } from 'src/game/dto/error.message.dto';
import {
  GameInvitationAnswerDto,
  GameInvitationAnswerPassDto,
} from './dto/game.invitation.answer.dto';
import { GameInvitationAskDto } from './dto/game.invitation.ask.dto';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';
import {
  ChatEnterReqDto,
  ChatGeneralReqDto,
  ChatMainEnterReqDto,
  ChatRoomAdminReqDto,
  ChatRoomSetPasswordReqDto,
  ChatSendMsgReqDto,
  chatGetProfileDto,
} from './dto/chat.transaction.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://paulryu9309.ddns.net:3000', 'http://localhost:3000'],
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly inMemoryUsers: InMemoryUsers,
    private chat: Chat,
  ) {}
  private messanger: LoggerWithRes = new LoggerWithRes('ChatGateway');
  private logger: Logger = new Logger('ChatGateway');

  /***************************** DEFAULT *****************************/
  @WebSocketServer()
  server: Server;

  afterInit() {
    this.messanger.logWithMessage('afterInit', 'ChatGateway', 'Initialized!');
  }

  async handleConnection(client: Socket) {
    const userId: number = parseInt(client.handshake.query.userId as string);
    // FIXME: 함수로 빼기
    const user = await this.inMemoryUsers.getUserByIdFromIM(userId);
    if (!user) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'handleConnection',
        userId,
      );
    }
    //
    // FIXME: 함수로 빼기
    const dmChannelList: Promise<DMChannel[]> =
      this.chatService.findPrivateChannelByUserIdx(user.userIdx);
    dmChannelList.then((channels) => {
      channels.forEach((channel) => {
        client.join(`chat_room_${channel.channelIdx}`);
      });
    });
    //
    this.chat.setSocketList = this.chat.setSocketObject(client, user);
    this.messanger.logWithMessage('handleConnection', 'user', user.nickname);
  }

  async handleDisconnect(client: Socket) {
    const userId: number = parseInt(client.handshake.query.userId as string);
    // FIXME: 함수로 빼기
    const user = this.inMemoryUsers.getUserByIdFromIM(userId);
    if (!user) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'handleDisconnection',
        userId,
      );
    }
    //
    // FIXME: 함수로 빼기
    this.chat.removeSocketObject(this.chat.setSocketObject(client, user));
    const notDmChannelList: Channel[] = this.chat.getProtectedChannels;
    const channelForLeave: Channel[] = notDmChannelList?.filter((channel) =>
      channel.getMember.includes(user),
    );
    channelForLeave.forEach((channel) => {
      client.leave(`chat_room_${channel.getChannelIdx}`);
    });
    const dmChannelList: Promise<DMChannel[]> =
      this.chatService.findPrivateChannelByUserIdx(user.userIdx);
    dmChannelList.then((channels) => {
      channels.forEach((channel) => {
        client.leave(`chat_room_${channel.channelIdx}`);
      });
    });
    //
    await this.usersService.setIsOnline(user, OnlineStatus.OFFLINE);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Disconnect Done',
      'handleDisconnect',
    );
  }

  /***************************** SOCKET API  *****************************/
  // FIXME: 매개변수 DTO 로 Json.parse 대체하기
  // API: MAIN_ENTER_0
  @SubscribeMessage('main_enter')
  async enterMainPage(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatMainEnterReqDto: ChatMainEnterReqDto,
  ) {
    const { intra } = chatMainEnterReqDto;

    // FIXME: 1. connect 된 소켓의 유저 인트라와 요청한 인트라가 일치하는지 확인하는 함수 추가 필요
    const userId: number = parseInt(client.handshake.query.userId as string);
    const checkUser = await this.inMemoryUsers.getUserByIdFromIM(userId);
    if (checkUser.intra !== intra) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'main_enter',
        userId,
      );
    }
    //
    const user = await this.inMemoryUsers.getUserByIntraFromIM(intra);
    // FIXME: 2. 예외처리 함수 만들기
    if (!user) {
      client.disconnect();
      return this.messanger.logWithWarn(
        'enterMainPage',
        'intra',
        intra,
        'Not Found',
      );
    }
    //
    // FIXME: 3. emit value 만드는 함수로 빼기, DTO 만들기?
    const userObject = {
      imgUri: user.imgUri,
      nickname: user.nickname,
      userIdx: user.userIdx,
    };
    const friendList = await this.usersService.getFriendList(intra);
    const blockList = await this.inMemoryUsers.getBlockListByIdFromIM(
      user.userIdx,
    );
    const channelList = await this.chat.getProtectedChannels?.map(
      ({ getOwner: owner, getChannelIdx: channelIdx, getMode: mode }) => ({
        owner: owner.nickname,
        channelIdx,
        mode,
      }),
    );
    const main_enter = {
      friendList,
      channelList,
      blockList,
      userObject,
    };
    //
    client.emit('main_enter', main_enter);

    // API: MAIN_ENTER_1
    // FIXME: DTO 만들기?
    await this.usersService.setIsOnline(user, OnlineStatus.ONLINE);
    const BR_main_enter = {
      targetNickname: user.nickname,
      targetIdx: user.userIdx,
      isOnline: user.isOnline,
    };
    this.server.emit('BR_main_enter', BR_main_enter);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Enter Main Page and Notice to Others',
      'BR_main_enter',
    );
  }

  // API: MAIN_PROFILE
  @SubscribeMessage('user_profile')
  async handleGetProfile(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { userIdx, targetNickname, targetIdx } = chatGeneralReqDto;

    // FIXME: 함수로 빼기
    const userId: number = parseInt(client.handshake.query.userId as string);
    if (userId != userIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'user_profile',
        userId,
      );
    }
    const target = await this.inMemoryUsers.getUserByIdFromIM(targetIdx);
    if (target.nickname !== targetNickname) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'user_profile',
        userId,
      );
    }
    // FIXME: 함수로 빼기
    if (!target) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        targetNickname,
        'user_profile',
      );
    }
    //
    // FIXME: game 기록도 인메모리에서 관리하기로 했었나?? 전적 데이터 추가 필요
    const target_profile = new chatGetProfileDto(
      target.nickname,
      target.imgUri,
      target.rankpoint,
      target.win,
      target.lose,
      target.isOnline,
    );
    client.emit('user_profile', target_profile);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Get Profile',
      'user_profile',
    );
  }

  // API: MAIN_CHAT_0
  @SubscribeMessage('check_dm')
  async handleCheckDM(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { targetIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const check_dm: MessageInfo | boolean = await this.chatService.checkDM(
      userId,
      targetIdx,
    );
    if (check_dm === false) {
      client.emit('check_dm', []);
      return false;
    } else {
      client.emit('check_dm', check_dm);
    }
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Check DM',
      'check_dm',
    );
  }

  // API: MAIN_CHAT_1.
  @SubscribeMessage('create_dm')
  async createDM(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { targetNickname, targetIdx, msg } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    // 오프라인일 수도 있기 때문에 db 에서 가져옴
    const targetUser: UserObject = await this.usersService.getUserInfoFromDB(
      targetNickname,
    );
    if (targetUser.userIdx !== targetIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'user_profile',
        userId,
      );
    }
    const user: UserObject = await this.inMemoryUsers.getUserByIdFromIM(userId);
    // FIXME: 함수로 빼기
    if (!user) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'create_dm',
        userId,
      );
    }
    if (!targetUser) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        targetNickname,
        'create_dm',
      );
    }
    if (await this.chatService.checkDM(user.userIdx, targetUser.userIdx)) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Already Exist',
        'create_dm',
      );
    }
    // FIXME: 함수로 빼기
    const message: SendDMDto = { msg: msg };
    const checkBlock = await this.usersService.checkBlockList(
      user,
      this.inMemoryUsers,
      targetUser,
    );
    const newChannelAndMsg = await this.chatService.createDM(
      client,
      user,
      targetUser,
      message,
      checkBlock,
    );
    if (!newChannelAndMsg) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Fail to Create DM',
        'create_dm',
      );
    }
    this.server
      .to(`chat_room_${newChannelAndMsg.channelIdx}`)
      .emit('create_dm', newChannelAndMsg);
    //
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Create DM',
      'create_dm',
    );
  }

  // API: MAIN_CHAT_2
  @SubscribeMessage('chat_enter')
  async enterProtectedAndPublicRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatEnterReqDto: ChatEnterReqDto,
  ) {
    // TODO: DTO 로 인자 유효성 검사 및 json 파싱하기
    const { userNickname, userIdx, channelIdx, password } = chatEnterReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const checkUser = await this.inMemoryUsers.getUserByIdFromIM(userId);
    if (checkUser.nickname !== userNickname || checkUser.userIdx !== userIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'chat_enter',
        userId,
      );
    }

    let channel: any = await this.chatService.findChannelByRoomId(channelIdx);
    const user: UserObject = await this.inMemoryUsers.getUserByIdFromIM(
      userIdx,
    );

    // FIXME: 함수로 빼기
    if (!user) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_enter',
        userNickname,
      );
    }
    if (!channel) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_enter',
        'channel',
      );
    }
    // channel 의 Ban List 에 있는지 확인
    const checkBan = this.chatService.checkBanList(channel, user);
    if (checkBan) {
      return this.messanger.setResponseMsgWithLogger(
        201,
        'Banned User',
        'chat_enter',
      );
    }
    // FIXME: service 로직으로 빼기
    if (channel instanceof Channel) {
      if (channel.getMode === Mode.PUBLIC) {
        this.messanger.logWithMessage(
          'enterProtectedAndPublicRoom',
          'channel',
          'Public Channel',
        );
        channel = await this.chatService.enterPublicRoom(user, channel);
      } else {
        this.messanger.logWithMessage(
          'enterProtectedAndPublicRoom',
          'channel',
          'Protected Channel',
        );
        if (channel.getPassword !== password) {
          return this.messanger.setResponseErrorMsgWithLogger(
            400,
            'Fail to Enter Protected Channel',
            'chat_enter',
          );
        }
        channel = await this.chatService.enterProtectedRoom(user, channel);
      }
    }
    //
    client.join(`chat_room_${channel.channelIdx}`);
    client.emit('chat_enter', channel);
    this.messanger.setResponseMsgWithLogger(
      200,
      'Done Chat Enter',
      'chat_enter',
    );
    //

    // API: MAIN_CHAT_3
    // FIXME: 함수로 빼기
    const member = await channel.member?.map((member) => {
      return {
        userIdx: member.userIdx,
        nickname: member.nickname,
        imgUri: member.imgUri,
      };
    });
    const admin = await channel.admin?.map((member) => {
      return {
        nickname: member.nickname,
      };
    });
    // FIXME: 함수로 빼기
    if (member) {
      const newMember = await member.find(
        (member) => member.userIdx === userIdx,
      );
      if (newMember) {
        const memberInfo = {
          member: member,
          admin: admin,
          newMember: newMember.nickname,
        };
        this.server
          .to(`chat_room_${channel.channelIdx}`)
          .emit('chat_enter_noti', memberInfo);
      } else {
        return this.messanger.setResponseErrorMsgWithLogger(
          400,
          'newMember Not Found',
          'chat_enter_noti',
        );
      }
    } else {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'member Not Found',
        'chat_enter_noti',
      );
    }
    //
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Enter Noti',
      'chat_enter_noti',
    );
  }

  // API: MAIN_CHAT_4
  @SubscribeMessage('chat_send_msg')
  async sendChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatSendMsgReqDto: ChatSendMsgReqDto,
  ) {
    const { channelIdx, senderIdx, msg, targetIdx } = chatSendMsgReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const user: UserObject = this.inMemoryUsers.getUserByIdFromIM(userId);
    const target: UserObject = this.inMemoryUsers.getUserByIdFromIM(targetIdx);
    const channel: Channel | DMChannel =
      await this.chatService.findChannelByRoomId(channelIdx);
    if (user.userIdx !== senderIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'chat_send_msg',
        userId,
      );
    }
    // FIXME: service 로 빼기
    if (channel instanceof Channel) {
      const msgInfo = await this.chatService.saveMessageInIM(
        channelIdx,
        senderIdx,
        msg,
      );
      const checkMute = this.chatService.checkMuteList(channel, user);
      if (checkMute) {
        return this.messanger.setResponseMsgWithLogger(
          200,
          'Muted User',
          'chat_send_msg',
        );
      }
      await this.server
        .to(`chat_room_${channelIdx}`)
        .emit('chat_send_msg', msgInfo);
    } else if (channel instanceof DMChannel) {
      if (!target) {
        return this.messanger.setResponseErrorMsgWithLogger(
          400,
          'Not Found',
          'chat_send_msg',
          targetIdx,
        );
      }
      const message: SendDMDto = { msg: msg };
      const msgInfo = await this.chatService
        .saveMessageInDB(channelIdx, senderIdx, message)
        .then((msgInfo) => {
          return {
            channelIdx: channelIdx,
            senderIdx: senderIdx,
            msg: message.msg,
            msgDate: msgInfo.msgDate,
          };
        });
      const checkBlock = await this.usersService.checkBlockList(
        user,
        this.inMemoryUsers,
        target,
      );
      if (checkBlock) {
        return this.messanger.setResponseMsgWithLogger(
          200,
          'Blocked User',
          'chat_send_msg',
        );
      }
      this.server.to(`chat_room_${channelIdx}`).emit('chat_send_msg', msgInfo);
    } else {
      return this.messanger.setResponseErrorMsgWithLogger(
        500,
        'Unexpected type of channel',
        'chat_send_msg',
      );
    }
    //
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Send Message',
      'chat_send_msg',
    );
  }

  // API: MAIN_CHAT_5
  @SubscribeMessage('BR_chat_create_room')
  async createPrivateAndPublicChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { password = '' } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const user = this.inMemoryUsers.getUserByIdFromIM(userId);
    if (!user) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'BR_chat_create_room',
        userId,
      );
    }

    const channelInfo = await this.chatService.createPublicAndProtected(
      password,
      user,
    );
    client.join(`chat_room_${channelInfo.channelIdx}`);
    this.server.emit('BR_chat_create_room', channelInfo);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Create Public & Private Room',
      'BR_chat_create_room',
    );
  }

  // API: MAIN_CHAT_6
  @SubscribeMessage('chat_room_admin')
  async setAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomAdminReqDto: ChatRoomAdminReqDto,
  ) {
    const { channelIdx, userIdx, grant } = chatRoomAdminReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const checkUser = await this.inMemoryUsers.getUserByIdFromIM(userId);
    if (checkUser.userIdx !== userIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'chat_room_admin',
        userId,
      );
    }
    const channel = this.chat.getProtectedChannel(channelIdx);
    // FIXME: 함수로 빼기
    if (!channel) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_room_admin',
        'channel',
      );
    }

    // owner 유효성 검사
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userId;
    });
    if (user === undefined) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_room_admin',
        'user',
      );
    }
    const isOwner: boolean = channel.getOwner.userIdx === user.userIdx;
    if (!isOwner) {
      return this.messanger.logWithWarn(
        'chat_room_admin',
        'user',
        user.nickname,
        'Not Owner',
      );
    }

    // 대상 유효성 검사
    const target = channel.getMember.find((member) => {
      return member.userIdx === userIdx;
    });
    if (target === undefined) {
      return this.messanger.logWithWarn(
        'chat_room_admin',
        'target',
        target.nickname,
        'Not Found Target',
      );
    }

    // 대상 권한 검사
    const checkGrant = channel.getAdmin.some(
      (admin) => admin.userIdx === target.userIdx,
    );
    if (grant === checkGrant) {
      return this.messanger.logWithMessage(
        'chat_room_admin',
        'target',
        target.nickname,
        'Already Granted',
      );
    }
    //
    // 대상 권한 부여 및 emit
    const adminInfo = this.chatService.setAdmin(channel, target, grant);
    this.server
      .to(`chat_room_${channelIdx}`)
      .emit('chat_room_admin', adminInfo);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Set Admin',
      'chat_room_admin',
    );
  }

  // API: MAIN_CHAT_7
  @SubscribeMessage('BR_chat_room_password')
  changePassword(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatRoomSetPasswordReqDto: ChatRoomSetPasswordReqDto,
  ) {
    const { channelIdx, userIdx, changePassword } = chatRoomSetPasswordReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const channel = this.chat.getProtectedChannel(channelIdx);

    // FIXME: 함수로 빼기
    if (userId != userIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'BR_chat_room_password',
        userId,
      );
    }
    // 채널 유효성 검사
    if (!channel) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'BR_chat_room_password',
        'channel',
      );
    }

    // owner 유효성 검사
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userId;
    });
    if (user === undefined) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'BR_chat_room_password',
        'user',
      );
    }
    const isOwner: boolean = channel.getOwner.userIdx === user.userIdx;
    if (!isOwner) {
      return this.messanger.logWithWarn(
        'BR_chat_room_password',
        'user',
        user.nickname,
        'Not Owner',
      );
    }
    const channelInfo = this.chatService.changePassword(
      channel,
      changePassword,
    );

    this.server.emit('BR_chat_room_password', channelInfo);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done Change Password',
      'BR_chat_room_password',
    );
  }

  // API: MAIN_CHAT_9
  @SubscribeMessage('chat_goto_lobby')
  goToLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { channelIdx, userIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    if (userId != userIdx) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'chat_goto_lobby',
        userId,
      );
    }
    const channel = this.chat.getProtectedChannel(channelIdx);
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userIdx;
    });
    if (user === undefined) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_goto_lobby',
        'user',
      );
    }
    const channelInfo = this.chatService.goToLobby(client, channel, user);
    client.emit('chat_goto_lobby', channelInfo);
    this.messanger.logWithMessage(
      'chat_goto_lobby',
      'user',
      user.nickname,
      'Done Go To Lobby',
    );

    // API: MAIN_CHAT_10
    const isEmpty = this.chatService.checkEmptyChannel(channel);
    if (isEmpty) {
      const channels = this.chatService.removeEmptyChannel(channel);
      this.server.emit('BR_chat_room_delete', channels);
      return this.messanger.setResponseMsgWithLogger(
        200,
        'Done delete channel',
        'BR_chat_room_delete',
      );
    }

    // API: MAIN_CHAT_8
    const announce = this.chatService.exitAnnounce(channel);
    this.server.to(`chat_room_${channelIdx}`).emit('chat_room_exit', announce);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done exit room',
      'chat_room_exit',
    );
  }

  // API: MAIN_CHAT_12
  @SubscribeMessage('chat_mute')
  setMute(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { channelIdx, targetNickname, targetIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const channel: Channel = this.chat.getProtectedChannel(channelIdx);
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userId;
    });
    if (user === undefined) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_mute',
        'user',
      );
    }
    const userIsAdmin: boolean = channel.getAdmin.some(
      (admin) => admin.userIdx === user.userIdx,
    );
    if (!userIsAdmin) {
      return this.messanger.logWithWarn(
        'chat_mute',
        'user',
        user.nickname,
        'Not Admin',
      );
    }
    // 대상 유효성 검사
    const target = channel.getMember.find((member) => {
      return member.userIdx === targetIdx;
    });
    if (target.nickname !== targetNickname) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'chat_mute',
        target.nickname,
      );
    }
    if (target === undefined) {
      return this.messanger.logWithWarn(
        'chat_mute',
        'target',
        user.nickname,
        'Not Found Target',
      );
    }
    // 대상 권한 검사
    const targetIsAdmin: boolean = channel.getAdmin.some((admin) => {
      return admin.userIdx === target.userIdx;
    });
    if (targetIsAdmin) {
      return this.messanger.logWithMessage(
        'chat_mute',
        'target',
        user.nickname,
        'Cannot mute',
      );
    }
    let muteInfo = this.chatService.setMute(channel, target, true);

    // 방 입장 시각을 기준으로 30초 후에 뮤트 해제
    setTimeout(() => {
      muteInfo = this.chatService.setMute(channel, target, false);
      this.server.to(`chat_room_${channelIdx}`).emit('chat_mute', muteInfo);
    }, 10000);
    this.server.to(`chat_room_${channelIdx}`).emit('chat_mute', muteInfo);
    // return '뮤트 처리 되었습니다.';
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done mute',
      'chat_mute',
    );
  }

  // API: MAIN_CHAT_13
  @SubscribeMessage('chat_kick')
  kickMember(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { channelIdx, targetNickname, targetIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const channel = this.chat.getProtectedChannel(channelIdx);

    // owner 유효성 검사
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userId;
    });
    if (user === undefined) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_kick',
        'user',
      );
    }
    const userIsAdmin: boolean = channel.getAdmin.some(
      (admin) => admin.userIdx === user.userIdx,
    );
    if (!userIsAdmin) {
      return this.messanger.logWithWarn(
        'chat_kick',
        'user',
        user.nickname,
        'Not Admin',
      );
    }
    // 대상 유효성 검사
    const target = channel.getMember.find((member) => {
      return member.userIdx === targetIdx;
    });
    if (target.nickname !== targetNickname) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'chat_kick',
        target.nickname,
      );
    }
    if (target === undefined) {
      return this.messanger.logWithWarn(
        'chat_kick',
        'target',
        user.nickname,
        'Not Found Target',
      );
    }
    // 대상 권한 검사
    const targetIsAdmin: boolean = channel.getAdmin.some((admin) => {
      return admin.userIdx === target.userIdx;
    });
    if (targetIsAdmin) {
      return this.messanger.logWithMessage(
        'chat_kick',
        'target',
        user.nickname,
        'Cannot kick',
      );
    }
    // 대상이 나간걸 감지 후 emit
    const channelInfo = this.chatService.kickMember(channel, target);
    this.server.to(`chat_room_${channelIdx}`).emit('chat_kick', channelInfo);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done kick',
      'chat_kick',
    );
  }

  // API: MAIN_CHAT_14
  @SubscribeMessage('chat_ban')
  banMember(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { channelIdx, targetNickname, targetIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const channel = this.chat.getProtectedChannel(channelIdx);

    // owner 유효성 검사
    const user: UserObject = channel.getMember.find((member) => {
      return member.userIdx === userId;
    });
    if (user === undefined) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_ban',
        'user',
      );
    }
    const userIsAdmin: boolean = channel.getAdmin.some(
      (admin) => admin.userIdx === user.userIdx,
    );
    if (!userIsAdmin) {
      return this.messanger.logWithWarn(
        'chat_ban',
        'user',
        user.nickname,
        'Not Admin',
      );
    }
    // 대상 유효성 검사
    const target = channel.getMember.find((member) => {
      return member.userIdx === targetIdx;
    });
    if (target.nickname !== targetNickname) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'chat_ban',
        target.nickname,
      );
    }
    if (target === undefined) {
      return this.messanger.logWithWarn(
        'chat_ban',
        'target',
        user.nickname,
        'Not Found Target',
      );
    }
    // 대상 권한 검사
    const targetIsAdmin: boolean = channel.getAdmin.some((admin) => {
      return admin.userIdx === target.userIdx;
    });
    if (targetIsAdmin) {
      return this.messanger.logWithMessage(
        'chat_ban',
        'target',
        user.nickname,
        'Cannot Ban',
      );
    }

    const banInfo = this.chatService.setBan(channel, target);
    console.log('after ban : ', channel);
    this.server.to(`chat_room_${channelIdx}`).emit('chat_ban', banInfo);
    return this.messanger.setResponseMsgWithLogger(200, 'Done ban', 'chat_ban');
  }

  // API: MAIN_CHAT_15
  @SubscribeMessage('chat_block')
  async blockMember(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    // FIXME: targetnickname 과 targetIdx 가 서로 맞는지 비교
    // FIXME: targetIdx 가 본인인지 확인
    const { targetNickname, targetIdx } = chatGeneralReqDto;
    const userId: number = parseInt(client.handshake.query.userId as string);
    const user: UserObject = this.inMemoryUsers.getUserByIdFromIM(userId);
    const targetUser: UserObject =
      this.inMemoryUsers.getUserByIdFromIM(targetIdx);
    if (targetUser.nickname !== targetNickname) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Request',
        'chat_block',
        targetNickname,
      );
    }
    if (!targetUser) {
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Not Found',
        'chat_block',
        targetNickname,
      );
    }
    const blockInfo = await this.usersService.setBlock(
      targetNickname,
      user,
      this.inMemoryUsers,
    );
    client.emit('chat_block', blockInfo);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done block',
      'chat_block',
    );
  }

  // API: MAIN_CHAT_16
  @SubscribeMessage('chat_get_roomList')
  getPublicAndProtectedChannel(@ConnectedSocket() client: Socket) {
    const channels = this.chatService.getPublicAndProtectedChannel();
    client.emit('chat_get_roomList', channels);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done get RoomList',
      'chat_get_roomList',
    );
  }

  // API: MAIN_CHAT_17
  @SubscribeMessage('chat_get_DMList')
  async getPrivateChannels(@ConnectedSocket() client: Socket) {
    const userId = parseInt(client.handshake.query.userId as string);
    const user: UserObject = this.inMemoryUsers.getUserByIdFromIM(userId);
    const channels = await this.chatService.getPrivateChannels(user);
    client.emit('chat_get_DMList', channels);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done get DMList',
      'chat_get_DMList',
    );
  }

  // API: MAIN_CHAT_18
  @SubscribeMessage('chat_get_DM')
  async getPrivateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { channelIdx } = chatGeneralReqDto;
    const dm: MessageInfo = await this.chatService.getPrivateChannel(
      channelIdx,
    );
    console.log(dm);
    client.emit('chat_get_DM', dm);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done get DM',
      'chat_get_DM',
    );
  }

  // API: MAIN_CHAT_20
  @SubscribeMessage('chat_get_grant')
  async getGrant(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatGeneralReqDto: ChatGeneralReqDto,
  ) {
    const { userIdx, channelIdx } = chatGeneralReqDto;
    const user: UserObject = this.inMemoryUsers.getUserByIdFromIM(userIdx);
    const userId: number = parseInt(client.handshake.query.userId as string);
    if (user.userIdx !== userId) {
      client.disconnect();
      return this.messanger.setResponseErrorMsgWithLogger(
        400,
        'Improper Access',
        'chat_get_grant',
        userId,
      );
    }
    const channel = this.chat.getProtectedChannel(channelIdx);
    const grant = this.chatService.getGrant(channel, user);
    client.emit('chat_get_grant', grant);
    return this.messanger.setResponseMsgWithLogger(
      200,
      'Done get Grant',
      'chat_get_grant',
    );
  }

  @SubscribeMessage('chat_invite_ask')
  async inviteFriendToGame(@MessageBody() invitation: GameInvitationDto) {
    const targetTuple = this.chat.getUserTuple(invitation.targetUserIdx);
    const targetSocket = targetTuple[1];
    const userTuple = this.chat.getUserTuple(invitation.myUserIdx);
    const myObject = userTuple[0];
    if (targetSocket === undefined) {
      return new ReturnMsgDto(400, 'Bad Request, target user is not online');
    }
    // in memory 로 바꿀까?
    const target = this.inMemoryUsers.getUserByIdFromIM(targetTuple[0].userIdx);
    // const target = await this.usersService.getUserInfoFromDBById(
    //   targetTuple[0].userIdx,
    // );
    if (target.isOnline === OnlineStatus.ONGAME) {
      return new ReturnMsgDto(400, 'Bad Request, target user is on Game');
    } else if (target.isOnline === OnlineStatus.ONLINE) {
      const invitaionCard = new GameInvitationAskDto(
        myObject.userIdx,
        myObject.nickname,
      );
      targetSocket.emit('chat_invite_answer', invitaionCard);
    } else {
      return new ReturnMsgDto(400, 'Bad Request, target user is offline');
    }
    return new ReturnMsgDto(200, 'OK!');
  }

  @SubscribeMessage('chat_invite_answer')
  acceptFriendToGame(@MessageBody() answer: GameInvitationAnswerDto) {
    const inviteTuple = this.chat.getUserTuple(answer.inviteUserIdx);
    const targetTuple = this.chat.getUserTuple(answer.targetUserIdx);
    const inviteSocket = inviteTuple[1];
    const targetSocket = targetTuple[1];
    const inviteUser: UserObject = inviteTuple[0];
    const targetUser: UserObject = targetTuple[0];
    const answerCard = new GameInvitationAnswerPassDto(
      inviteUser,
      targetUser,
      answer.answer,
    );
    if (answer.answer === true) {
      this.usersService.setIsOnline(targetUser, OnlineStatus.ONGAME);
      this.usersService.setIsOnline(inviteUser, OnlineStatus.ONGAME);
    }
    inviteSocket.emit('chat_receive_answer', answerCard);
    targetSocket.emit('chat_receive_answer', answerCard);
    return new ReturnMsgDto(200, 'Ok!');
  }
}
