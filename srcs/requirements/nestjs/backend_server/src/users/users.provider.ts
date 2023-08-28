import { Injectable } from '@nestjs/common';
import { BlockList } from 'src/entity/blockList.entity';
import { UserObject } from 'src/entity/users.entity';

@Injectable()
export class InMemoryUsers {
  // FIXME: private 으로 바꾸기
  inMemoryUsers: UserObject[] = [];
  inMemoryBlockList: BlockList[] = [];

  getUserByIntraFromIM(intra: string): UserObject {
    return this.inMemoryUsers.find((user) => user.intra === intra);
  }

  getUserByIdFromIM(userId: number): UserObject {
    return this.inMemoryUsers.find((user) => user.userIdx === userId);
  }

  getBlockListByIdFromIM(userId: number): BlockList[] {
    return this.inMemoryBlockList.filter((user) => user.userIdx === userId);
  }

  setBlockListByIdFromIM(blockList: BlockList): void {
    this.inMemoryBlockList.push(blockList);
  }

  removeBlockListByNicknameFromIM(nickname: string): void {
    this.inMemoryBlockList = this.inMemoryBlockList.filter(
      (user) => user.blockedNickname !== nickname,
    );
  }
}
