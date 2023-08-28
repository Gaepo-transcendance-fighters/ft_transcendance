import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { UserObject } from 'src/entity/users.entity';
import { UserObjectRepository } from './users.repository';
import { BlockList } from '../entity/blockList.entity';
import { BlockTargetDto } from './dto/block-target.dto';
import { time } from 'console';

//
@CustomRepository(BlockList)
export class BlockListRepository extends Repository<BlockList> {
  async blockTarget(
    targetNickname: string,
    user: UserObject,
    userList: UserObjectRepository,
  ): Promise<BlockList> {
    const data = await userList.findOne({
      where: { nickname: targetNickname },
    });
    if (!data) {
      throw new Error(`There is a no name, ${targetNickname}`);
    }

    const check = await this.findOne({
      where: { userIdx: user.userIdx, blockedUserIdx: data.userIdx },
    });
    if (check) {
      await this.remove(check);
    } else if (!check) {
      const target = this.create({
        userIdx: user.userIdx,
        blockedUserIdx: data.userIdx,
        blockedNickname: data.nickname,
      });
      await this.save(target);
      return target;
    }
  }

  async getBlockedList(user: UserObject) {
    const blockedList = await this.find({
      where: { userIdx: user.userIdx },
    });
    const members = await Promise.all(
      blockedList.map(async (blocked) => {
        return {
          targetNickname: blocked.blockedNickname,
          targetIdx: blocked.blockedUserIdx,
        };
      }),
    );
    return members;
  }
}
