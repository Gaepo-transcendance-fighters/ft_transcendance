import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { DMChannel, DirectMessage } from '../entity/chat.entity';
import { SendDMDto } from './dto/send-dm.dto';
import { UserObject } from 'src/entity/users.entity';

@CustomRepository(DMChannel)
export class DMChannelRepository extends Repository<DMChannel> {
  async createChannel(
    client: UserObject,
    target: UserObject,
    channelIdx: number,
  ): Promise<DMChannel[]> {
    const list: DMChannel[] = [];

    const channel1 = await this.create({
      userIdx1: client.userIdx,
      userIdx2: target.userIdx,
      userNickname1: client.nickname,
      userNickname2: target.nickname,
      channelIdx: channelIdx,
    });

    const channel2 = await this.create({
      userIdx1: target.userIdx,
      userIdx2: client.userIdx,
      userNickname1: target.nickname,
      userNickname2: client.nickname,
      channelIdx: channelIdx,
    });

    list.push(channel1);
    list.push(channel2);
    return list;
  }

  async findDMChannel(userIdx1: number, userIdx2: number): Promise<DMChannel> {
    const channels = await this.findOne({
      where: [{ userIdx1: userIdx1, userIdx2: userIdx2 }],
    });
    return channels;
  }

  async findDMChannelsByUserIdx(userIdx: number): Promise<DMChannel[]> {
    const channels = await this.find({
      where: [{ userIdx1: userIdx }],
    });
    return channels;
  }

  async findDMChannelByChannelIdx(channelIdx: number): Promise<DMChannel> {
    const channel = await this.findOne({
      where: [{ channelIdx: channelIdx }],
    });
    return channel;
  }

  async getMaxChannelIdxInDB(): Promise<number> {
    const maxChannelIdx = await this.createQueryBuilder('dm')
      .select('MAX(dm.channelIdx)', 'max')
      .getRawOne();
    return maxChannelIdx.max;
  }
}

@CustomRepository(DirectMessage)
export class DirectMessageRepository extends Repository<DirectMessage> {
  async sendDm(
    sendDm: SendDMDto,
    user: UserObject,
    channelIdx: number,
  ): Promise<DirectMessage> {
    const { msg } = sendDm;
    const now = new Date().toISOString().toString();
    console.log(now);

    const dmMessage = await this.create({
      channelIdx: channelIdx,
      sender: user.nickname,
      msg: msg,
      msgDate: now,
    });
    return dmMessage;
  }

  async findMessageList(channelIdx: number): Promise<DirectMessage[]> {
    const dmMessageList: DirectMessage[] = await this.createQueryBuilder('dm')
      .where('dm.channelIdx = :channelIdx', { channelIdx })
      .orderBy('dm.msgDate', 'DESC')
      .take(20)
      .getMany();
    return dmMessageList;
  }
}
