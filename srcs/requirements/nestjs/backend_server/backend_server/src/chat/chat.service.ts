import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Channel } from './class/chat.channel/channel.class';
import {
  Chat,
  MessageInfo,
  MessageInteface,
} from './class/chat.chat/chat.class';
import {
  DataSource,
  EntityManager,
  LessThan,
  LessThanOrEqual,
  Repository,
  Transaction,
} from 'typeorm';
import { Permission, UserObject } from 'src/entity/users.entity';
import {
  DMChannel,
  DirectMessage,
  HashedChannel,
  Mode,
} from '../entity/chat.entity';
import { DMChannelRepository, DirectMessageRepository } from './DM.repository';
import { SendDMDto } from './dto/send-dm.dto';
import { InMemoryUsers } from 'src/users/users.provider';
import { Socket } from 'socket.io';
import { Message } from './class/chat.message/message.class';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';
import { HashedChannelRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private chat: Chat,
    private dataSource: DataSource,
    private dmChannelRepository: DMChannelRepository,
    private directMessagesRepository: DirectMessageRepository,
    private hashedChannelRepository: HashedChannelRepository,
    // TODO: gateway에서도 InmemoryUsers 를 사용하는데, service 로 옮기자
    private inMemoryUsers: InMemoryUsers,
  ) {}

  private messanger: LoggerWithRes = new LoggerWithRes('ChatService');

  /********************* check Room Member & client *********************/
  // async checkAlreadyInRoom(clientData: any) {
  //   // find() 사용
  //   const channel = await this.findChannelByRoomId(clientData.roomId);
  //   // if (channel == null) {
  //   //   return false;
  //   // }
  //   return await channel.getMember.flat().find((member) => {
  //     return member === clientData.nickname;
  //   });
  //   // Set 사용
  //   // const channel = this.findChannelByRoomId(clientData.roomId);
  //   // const membersSet = new Set(channel.getMember.flat());
  //   // // console.log(membersSet);
  //   // return membersSet.has(clientData.nickname);
  // }

  /***************************** Find Channel *****************************/
  // TODO: 아래 세가지 함수로 하나로 합치는게 좋을까? 논의 필요
  // 합치게 되면, 반환되는 채널이 어떤 채널인지 구분할 수 있는 방법이 필요함.
  async findChannelByRoomId(channelIdx: number): Promise<Channel | DMChannel> {
    let channel: Channel | DMChannel = this.chat.getProtectedChannels.find(
      (channel) => channel.getChannelIdx === channelIdx,
    );
    if (!channel) {
      channel = await this.dmChannelRepository.findDMChannelByChannelIdx(
        channelIdx,
      );
    }
    return channel;
  }

  findProtectedChannelByRoomId(roomId: number): Channel {
    const protectedChannel: Channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    if (protectedChannel == undefined || protectedChannel.getPassword == null) {
      return null;
    }
    return protectedChannel;
  }

  findHashedChannelByChannelIdx(channelIdx: number): Promise<HashedChannel> {
    const hashedChannel = this.hashedChannelRepository.findOneBy({
      channelIdx: channelIdx,
    });
    if (hashedChannel == undefined) {
      return null;
    }
    return hashedChannel;
  }

  findPublicChannelByRoomId(roomId: number): Channel {
    const publicChannel: Channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    if (publicChannel == undefined || publicChannel.getPassword != null) {
      return null;
    }
    return publicChannel;
  }

  findPrivateChannelByRoomId(roomId: number): Channel {
    // DB 에서 찾아야함
    // const privateChannel = this.chat.getPrivateChannels.find(
    //   (channel) => channel.getRoomId === roomId,
    // );
    // if (privateChannel == undefined) {
    //   return null;
    // }
    // return privateChannel;
    return null;
  }

  async findPrivateChannelByUserIdx(userIdx: number): Promise<DMChannel[]> {
    // DB 에서 찾아야함
    const privateChannelList: DMChannel[] =
      await this.dmChannelRepository.findDMChannelsByUserIdx(userIdx);
    if (!privateChannelList) {
      return null;
    }
    return privateChannelList;
  }

  /******************* Check and Create Channel function *******************/

  async createDmChannel(
    client: UserObject,
    target: UserObject,
    channelIdx: number,
    // msg: SendDMDto,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    let ret = true;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const list = await this.dmChannelRepository.createChannel(
        client,
        target,
        channelIdx,
      );
      // const firstDM = await this.directMessagesRepository.sendDm(
      //   msg,
      //   client,
      //   channelIdx,
      // );
      await queryRunner.manager.save(list[0]);
      await queryRunner.manager.save(list[1]);
      // await this.directMessagesRepository.save(firstDM);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      ret = false;
    } finally {
      await queryRunner.release();
    }
    return ret;
  }

  // FIXME: 반환값...
  async checkDM(
    userIdx: number,
    targetIdx: number,
  ): Promise<MessageInfo | boolean> {
    const dmChannel: DMChannel = await this.dmChannelRepository.findDMChannel(
      userIdx,
      targetIdx,
    );
    if (!dmChannel) {
      this.messanger.logWithMessage(
        'checkDM',
        'dmChannel',
        'null',
        'No DM Channel',
      );
      return false;
    }
    const dmMessageList = await Promise.all(
      (
        await this.directMessagesRepository.findMessageList(
          dmChannel.channelIdx,
        )
      ).map(async (dm) => {
        return {
          sender: dm.sender,
          msg: dm.msg,
          msgDate: dm.msgDate,
        };
      }),
    );
    const messageInfo: MessageInfo = {
      message: dmMessageList,
      userIdx1: dmChannel.userIdx1,
      userIdx2: dmChannel.userIdx2,
      userNickname1: dmChannel.userNickname1,
      userNickname2: dmChannel.userNickname2,
      channelIdx: dmChannel.channelIdx,
    };
    return messageInfo;
  }

  async createDM(
    client: Socket,
    user: UserObject,
    targetUser: UserObject,
    // msg: SendDMDto,
    checkBlock: boolean,
  ) {
    const channelIdx = await this.setNewChannelIdx();
    // TODO: 예외처리 필요
    await this.createDmChannel(user, targetUser, channelIdx);
    // await this.createDmChannel(user, targetUser, channelIdx, msg);

    const userChannelsInfo = [];
    const targetChannelsInfo = [];

    const userChannels: DMChannel[] =
      await this.dmChannelRepository.findDMChannelsByUserIdx(user.userIdx);
    for (const channel of userChannels) {
      const blockList = await this.inMemoryUsers.getBlockListByIdFromIM(
        channel.userIdx1,
      );
      const isBlocked = blockList.some(
        (user) => user.blockedUserIdx === channel.userIdx2,
      );
      if (!isBlocked) {
        // 원하는 속성만 뽑아서 객체로 만들고 push 하기
        const channelInfo = {
          targetNickname: channel.userNickname2,
          channelIdx: channel.channelIdx,
          mode: Mode.PRIVATE,
        };
        userChannelsInfo.push(channelInfo);
      }
    }
    const targetChannels: DMChannel[] =
      await this.dmChannelRepository.findDMChannelsByUserIdx(
        targetUser.userIdx,
      );
    for (const channel of targetChannels) {
      const blockList = await this.inMemoryUsers.getBlockListByIdFromIM(
        channel.userIdx2,
      );
      const isBlocked = blockList.some(
        (user) => user.blockedUserIdx === channel.userIdx2,
      );
      if (!isBlocked) {
        // 원하는 속성만 뽑아서 객체로 만들고 push 하기
        const channelInfo = {
          targetNickname: channel.userNickname2,
          channelIdx: channel.channelIdx,
          mode: Mode.PRIVATE,
        };
        targetChannelsInfo.push(channelInfo);
      }
    }
    if (checkBlock) {
      this.messanger.logWithMessage(
        'createDM',
        'checkBlock',
        'true',
        '차단된 유저입니다.',
      );
    } else {
      const targetSocket = await this.chat.getSocketObject(targetUser.userIdx);
      if (targetSocket) {
        await targetSocket.socket.join(`chat_room_${channelIdx}`);
        await targetSocket.socket.emit('create_dm', targetChannelsInfo);
      } else {
        this.messanger.logWithMessage(
          'createDM',
          'targetSocket',
          'null',
          '상대방 소켓이 없습니다.',
        );
      }
    }
    client.join(`chat_room_${channelIdx}`);
    return userChannelsInfo;
  }

  async createPublicAndProtected(password: string, user: UserObject) {
    const channelIdx = await this.setNewChannelIdx();
    // FIXME: 함수로 빼기
    const channel = new Channel();
    channel.setChannelIdx = channelIdx;
    channel.setRoomId = channelIdx;
    channel.setMember = user;
    channel.setOwner = user;
    channel.setAdmin = user;
    if (password === '') {
      channel.setMode = Mode.PUBLIC;
    } else if (password !== '') {
      channel.setMode = Mode.PROTECTED;
      const hashedPassword = await this.hashPassword(password);
      const hashed = this.hashedChannelRepository.create({
        channelIdx: channelIdx,
        hasedPassword: hashedPassword,
      });
      this.hashedChannelRepository.save(hashed);
      // console.log('hashed', hashed);
    }
    channel.setPassword = password;
    this.chat.setProtectedChannels = channel;
    const channelInfo = {
      owner: channel.getOwner.nickname,
      channelIdx: channel.getChannelIdx,
      mode: channel.getMode,
    };
    return channelInfo;
  }

  async setNewChannelIdx(): Promise<number> {
    const maxChannelIdxInIM = await this.chat.getMaxChannelIdxInIM();
    const maxChannelIdxInDB =
      await this.dmChannelRepository.getMaxChannelIdxInDB();
    const channelIdx = Math.max(maxChannelIdxInIM, maxChannelIdxInDB) + 1;
    return channelIdx;
  }

  /******************* Save Message Funcions *******************/

  async saveMessageInIM(channelIdx: number, senderIdx: number, msg: string) {
    const channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getChannelIdx === channelIdx,
    );
    const msgInfo = new Message(channelIdx, senderIdx, msg);
    msgInfo.setMsgDate = new Date().toString();
    if (channel) {
      channel.setMessage = msgInfo;
    } else {
      // console.log('Channel not found.');
      return;
    }
    const sender = await this.inMemoryUsers.getUserByIdFromIM(senderIdx);

    const message = {
      channelIdx: channelIdx,
      senderIdx: sender.userIdx,
      msg: msgInfo.getMessage,
      msgDate: msgInfo.getMsgDate,
    };
    return message;
  }

  async saveMessageInDB(channelIdx: number, senderIdx: number, msg: SendDMDto) {
    const message: SendDMDto = {
      msg: msg.msg,
    };
    const queryRunner = this.dataSource.createQueryRunner();
    const user = await this.inMemoryUsers.getUserByIdFromIM(senderIdx);

    let dm;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      dm = await this.directMessagesRepository.sendDm(
        message,
        user,
        channelIdx,
      );
      // console.log(dm);
      await queryRunner.manager.save(dm);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return;
    } finally {
      await queryRunner.release();
    }
    return dm;
  }

  /******************* Save Message Funcions *******************/
  async enterPublicRoom(user: UserObject, channel: Channel) {
    if (
      !channel.getMember?.some((member) => member?.userIdx === user?.userIdx)
    ) {
      channel.setMember = user;
    }
    const channelInfo = {
      member: channel.getMember.map((member) => {
        return {
          userIdx: member?.userIdx,
          nickname: member?.nickname,
          imgUri: member?.imgUri,
        };
      }),
      admin: channel.getAdmin?.map((member) => {
        return {
          nickname: member.nickname,
        };
      }),
      channelIdx: channel.getChannelIdx,
    };
    return channelInfo;
  }
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // 솔트(암호화 추가 요소) 사용 및 10번의 해싱 라운드를 적용합니다.
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  // 이 함수는 로그인 시 비밀번호 검증에 사용될 수 있습니다.
  async comparePasswords(
    enteredPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  async enterProtectedRoom(user: UserObject, channel: Channel) {
    if (
      !this.chat
        .getProtectedChannel(channel.getChannelIdx)
        .getMember.some((member) => member.userIdx === user.userIdx)
    ) {
      channel.setMember = user;
    }
    const channelInfo = {
      member: channel.getMember?.map((member) => {
        // console.log(member);
        return {
          userIdx: member.userIdx,
          nickname: member.nickname,
          imgUri: member.imgUri,
        };
      }),
      admin: channel.getAdmin?.map((member) => {
        return {
          nickname: member.nickname,
        };
      }),
      channelIdx: channel.getChannelIdx,
    };
    return channelInfo;
  }

  /******************* Funcions in chat *******************/
  getGrant(channelIdx: Channel, user: UserObject) {
    const checkOwner = channelIdx.getOwner.userIdx === user.userIdx;
    const checkAdmin = channelIdx.getAdmin.some(
      (member) => member.userIdx === user.userIdx,
    );
    if (checkOwner) {
      return Permission.OWNER;
    } else if (checkAdmin) {
      return Permission.ADMIN;
    }
    return Permission.MEMBER;
  }

  setAdmin(channel: Channel, user: UserObject, grant: boolean) {
    if (grant) {
      channel.setAdmin = user;
    } else {
      channel.removeAdmin(user);
    }
    const adminInfo = {
      userIdx: user.userIdx,
      grant: grant,
      admin: channel.getAdmin.map((member) => {
        return {
          nickname: member.nickname,
        };
      }),
    };
    return adminInfo;
  }

  checkMuteList(channel: Channel, user: UserObject) {
    const mute = channel.getMute.some(
      (member) => member.userIdx === user.userIdx,
    );
    return mute;
  }

  setMute(channel: Channel, targetUser: UserObject, mute: boolean) {
    if (mute) {
      channel.setMute = targetUser;
    } else {
      channel.removeMute(targetUser);
    }

    const muteInfo = {
      targetNickname: targetUser.nickname,
      targetIdx: targetUser.userIdx,
      mute: mute,
    };

    return muteInfo;
  }

  setBan(channel: Channel, user: UserObject) {
    this.kickMember(channel, user);
    // 퇴장시켜야함
    const ban = channel.getBan.some(
      (member) => member.userIdx === user.userIdx,
    );
    if (!ban) {
      channel.setBan = user;
    } else {
      return this.messanger.logWithMessage(
        'setBan',
        'target',
        user.nickname,
        'Already Banned',
      );
    }
    // console.log('ban', channel.getBan);
    const banInfo = {
      targetNickname: user.nickname,
      targetIdx: user.userIdx,
      leftMember: channel.getMember.map((member) => {
        return {
          userNickname: member.nickname,
          userIdx: member.userIdx,
          imgUri: member.imgUri,
        };
      }),
    };
    return banInfo;
  }

  kickMember(channel: Channel, user: UserObject) {
    channel.removeMember(user);
    if (channel.getAdmin.some((member) => member.userIdx === user.userIdx)) {
      channel.removeAdmin(user);
    }
    const userSocket = this.chat.getSocketObject(user.userIdx);
    // FIXME: return 으로 해도 될듯
    userSocket.socket.emit('chat_room_exit', '퇴장 당했습니다.');
    userSocket.socket.leave(`chat_room_${channel.getChannelIdx}`);
    const channelInfo = {
      targetNickname: user.nickname,
      targetIdx: user.userIdx,
      leftMember: channel.getMember.map((member) => {
        return {
          userNickname: member.nickname,
          userIdx: member.userIdx,
          imgUri: member.imgUri,
        };
      }),
    };
    return channelInfo;
  }

  checkBanList(channel: Channel, user: UserObject) {
    const ban = channel.getBan.some(
      (member) => member.userIdx === user.userIdx,
    );
    return ban;
  }

  changePassword(channel: Channel, password: string) {
    // console.log('pw: ', password);
    channel.setPassword = password;
    if (password === '' || !password) {
      channel.setMode = Mode.PUBLIC;
    } else {
      channel.setMode = Mode.PROTECTED;
    }
    const channels = this.getPublicAndProtectedChannel();
    return channels;
  }

  /******************* Functions about Exit Room *******************/

  goToLobby(client: Socket, channel: Channel, user: UserObject) {
    // console.log('chat Service : goToLobby');
    const isOwner: boolean = channel.getOwner?.userIdx === user.userIdx;
    const isAdmin: boolean = channel.getAdmin?.some(
      (member) => member.userIdx === user.userIdx,
    );

    channel.removeMember(user);
    if (isAdmin) {
      channel.removeAdmin(user);
    }
    if (isOwner) {
      channel.removeOwner();
      channel.setOwner = channel.getMember[0];
      channel.setAdmin = channel.getMember[0];
    }
    const channelsInfo = this.getPublicAndProtectedChannel().map((channel) => {
      return {
        owner: channel.owner,
        channelIdx: channel.channelIdx,
        mode: channel.mode,
      };
    });
    client.emit('chat_goto_lobby', channelsInfo);
    client.leave(`chat_room_${channel.getChannelIdx}`);
    
  }

  exitAnnounce(channel: Channel) {
    const channelInfo = {
      leftMember: channel.getMember.map((member) => {
        return {
          userNickname: member.nickname,
          userIdx: member.userIdx,
          imgUri: member.imgUri,
        };
      }),
      owner: channel.getOwner?.nickname,
    };
    return channelInfo;
  }

  checkEmptyChannel(channel: Channel) {
    if (channel.getMember.length === 0) {
      return true;
    }
    return false;
  }

  removeEmptyChannel(channel: Channel) {
    this.chat.removeChannel(channel.getChannelIdx);
    const channels = this.chat.getProtectedChannels.map((channel) => {
      return {
        owner: channel.getOwner?.nickname,
        channelIdx: channel.getChannelIdx,
        mode: channel.getMode,
      };
    });
    return channels;
  }

  getPublicAndProtectedChannel() {
    const channels = this.chat.getProtectedChannels?.map((channel) => {
      return {
        owner: channel.getOwner?.nickname,
        channelIdx: channel.getChannelIdx,
        mode: channel.getMode,
      };
    });
    return channels;
  }

  async getPrivateChannels(user: UserObject) {
    const channels: DMChannel[] =
      await this.dmChannelRepository.findDMChannelsByUserIdx(user.userIdx);

    const channelsInfo = [];
    for (const channel of channels) {
      channelsInfo.push({
        targetNickname: channel.userNickname2,
        channelIdx: channel.channelIdx,
        mode: Mode.PRIVATE,
      });
    }
    return channelsInfo;
  }

  // DM 채널 클릭 시
  async getPrivateChannel(channelIdx: number) {
    const channel: DMChannel =
      await this.dmChannelRepository.findDMChannelByChannelIdx(channelIdx);
    const dmMessageList = await Promise.all(
      (
        await this.directMessagesRepository.findMessageList(channelIdx)
      ).map(async (dm) => {
        return {
          sender: dm.sender,
          msg: dm.msg,
          msgDate: dm.msgDate,
        };
      }),
    );
    const totalMsgCount = dmMessageList.length;
    // console.log('dmMessageList: ', dmMessageList);
    // // 전체 개수를 5로 나눈다. 나눈 값이 10이라고 하면  7 + i, 8 + i, 9 + i, 10 + i 인텍스의 메시지를 더한다. (i는 0부터 5까지)
    const dmMessageListWhenEnterRoom = [];
    let totalPage = Math.floor(totalMsgCount / 5);
    if (totalMsgCount % 5 != 0) {
      totalPage += 1;
    }
    // console.log('totalPage: ', totalPage);
    let pageForStart = totalPage - 4;
    // console.log('pageForStart: ', pageForStart);
    for (let j = 0; j < 4; j++) {
      // console.log(pageForStart);
      for (let i = 0; i < 5; i++) {
        let num = i + pageForStart * 5;
        if (dmMessageList[num]) {
          dmMessageListWhenEnterRoom.push(dmMessageList[num]);
        }
      }
      pageForStart += 1;
    }
    dmMessageListWhenEnterRoom.reverse();
    // console.log('의심되는 부분입니다: ', dmMessageListWhenEnterRoom);
    const targetUser = await this.inMemoryUsers.getUserByIdFromIM(
      channel.userIdx2,
    );
    const messageInfo = {
      message: dmMessageListWhenEnterRoom,
      totalMsgCount: totalMsgCount,
      userIdx1: channel.userIdx1,
      userIdx2: channel.userIdx2,
      userNickname1: channel.userNickname1,
      userNickname2: channel.userNickname2,
      channelIdx: channel.channelIdx,
      imgUri: targetUser.imgUri,
    };
    return messageInfo;
  }

  // MAIN_CHAT_INFINITY
  async getChatMessagesByInfinity(channelIdx: number, page: string) {
    const messages = await this.directMessagesRepository.find({
      where: [{ channelIdx: channelIdx }],
    });
    // console.log('page : ', page);
    const messageList = [];
    for (let i = 0; i < 5; i++) {
      const num = i + (Number(page) - 1) * 5;
      if (messages[num]) {
        messageList.push(messages[num]);
      }
    }
    messageList.reverse();
    const messageInfo = await Promise.all(
      messageList.map(async (message) => {
        const senderIdx = (
          await this.inMemoryUsers.getUserByNicknameFromIM(message.sender)
        ).userIdx;
        return {
          channelIdx: message.channelIdx,
          senderIdx: senderIdx,
          msg: message.msg,
        };
      }),
    );
    return messageInfo;
  }
}
