import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { OnlineStatus, UserObject } from 'src/entity/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { CustomRepository } from 'src/typeorm-ex.decorator';

@CustomRepository(UserObject)
export class UserObjectRepository extends Repository<UserObject> {
  async createUser(createUsersDto: CreateUsersDto): Promise<UserObject> {
    const { userIdx, intra, nickname, imgUri } = createUsersDto;

    let user = this.create({
      userIdx: userIdx,
      intra: intra,
      nickname: nickname,
      imgUri: imgUri,
      rankpoint: 0,
      isOnline: OnlineStatus.ONLINE,
      available: true,
      win: 0,
      lose: 0,
    });
    
    return await this.save(user);
  }

  async setIsOnline(
    user: UserObject,
    isOnline: OnlineStatus,
  ): Promise<OnlineStatus> {
    user.isOnline = isOnline;
    await this.update(user.userIdx, { isOnline: user.isOnline });
    return user.isOnline;
  }

  async initServerUsers(): Promise<void> {
    const users = await this.find();
    await Promise.all(
      users.map(async (user) => {
        await this.update(user.userIdx, { isOnline: 1 });
      }),
    );
  }
}