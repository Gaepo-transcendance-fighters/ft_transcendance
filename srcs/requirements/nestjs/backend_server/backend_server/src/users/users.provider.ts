import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockList } from 'src/entity/blockList.entity';
import { UserObject } from 'src/entity/users.entity';
import { UserObjectRepository } from './users.repository';
import { BlockListRepository } from './blockList.repository';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class InMemoryUsers {
  inMemoryUsers: UserObject[] = [];
  inMemoryBlockList: BlockList[] = [];

  constructor(
    private readonly userObjectRepository: UserObjectRepository,
    private readonly blockListRepository: BlockListRepository,
  ) {
    this.initInMemoryUsers();
  }

  private async initInMemoryUsers(): Promise<void> {
    const users = await this.userObjectRepository.find();
    this.inMemoryUsers = users;

    const lists = await this.blockListRepository.find();
    this.inMemoryBlockList = lists;
  }

  async getUserByNicknameFromIM(nickname: string): Promise<UserObject> {
    await this.initInMemoryUsers();
    return this.inMemoryUsers.find((user) => user.nickname === nickname);
  }

  async getUserByIdFromIM(userId: number): Promise<UserObject> {
    await this.initInMemoryUsers();
    return this.inMemoryUsers.find((user) => user.userIdx === userId);
  }

  async saveUserByUserIdFromIM(userId: number): Promise<UserObject | null> {
    try {
      const targetUser = this.inMemoryUsers.find(
        (user) => user.userIdx === userId,
      );
      const ret = await this.userObjectRepository.save(targetUser);
      return ret;
    } catch (error) {
      if (error instanceof QueryFailedError)
        throw new NotFoundException(`Failed to create user: ` + error.message);
      return null;
    }
  }

  setUserByIdFromIM(updatedUser: UserObject): void {
    const userIndex = this.inMemoryUsers.findIndex(
      (user) => user.userIdx === updatedUser.userIdx,
    );
    this.inMemoryUsers[userIndex] = updatedUser;
    if (userIndex === -1) {
      this.inMemoryUsers.push(updatedUser);
    }
  }

  async getBlockListByIdFromIM(userId: number): Promise<BlockList[]> {
    await this.initInMemoryUsers();
    return this.inMemoryBlockList.filter((user) => user.userIdx === userId);
  }

  // unused
  setBlockListByIdFromIM(blockList: BlockList): void {
    const blockListIndex = this.inMemoryBlockList.findIndex(
      (block) => block.idx === blockList.idx,
    );
    this.inMemoryBlockList[blockListIndex] = blockList;
    if (blockListIndex === -1) {
      this.inMemoryBlockList.push(blockList);
    }
  }

  removeBlockListByIntraFromIM(nickname: string): void {
    this.inMemoryBlockList = this.inMemoryBlockList.filter(
      (user) => user.blockedNickname !== nickname,
    );
  }
}
