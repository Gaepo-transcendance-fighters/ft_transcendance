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
    targetIdx: number,
    user: UserObject,
    userList: UserObjectRepository,
  ): Promise<BlockList> {
    const data = await userList.findOne({
      where: { userIdx: targetIdx },
    });
    if (!data) {
      throw new Error(`There is no user`);
    }

    const check = await this.findOne({
      where: { userIdx: user.userIdx, blockedUserIdx: data.userIdx },
    });
    if (check) { // 이미 차단한 유저라면
      await this.remove(check); // 차단 해제
    } else if (!check) { // 차단하지 않은 유저라면
      const target = this.create({
        userIdx: user.userIdx,
        blockedUserIdx: data.userIdx,
        blockedNickname: data.nickname,
      });
      await this.save(target); // 차단
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
