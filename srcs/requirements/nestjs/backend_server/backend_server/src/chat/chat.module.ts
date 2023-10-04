import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './class/chat.chat/chat.class';
import { DMChannelRepository, DirectMessageRepository } from './DM.repository';
import { TypeOrmExModule } from '../typeorm-ex.module';
import { InMemoryUsers } from 'src/users/users.provider';
import { UsersService } from 'src/users/users.service';
import { Channel } from './class/chat.channel/channel.class';
import { Mode } from '../entity/chat.entity';
import { SharedModule } from 'src/shared/shared.module';
import { ChatController } from './chat.controller';
import { GameModule } from 'src/game/game.module';
import { GameRecordRepository } from 'src/game/game.record.repository';
import { GameChannelRepository } from 'src/game/game.channel.repository';
import { HashedChannelRepository } from './chat.repository';

@Module({
  // TODO: Member 와 관련된 것을 추가해야함
  imports: [
    TypeOrmExModule.forCustomRepository([
      // DMChannelRepository,
      DirectMessageRepository,
      GameRecordRepository,
      GameChannelRepository,
      HashedChannelRepository,
    ]),
    SharedModule,
  ],
  providers: [ChatGateway, ChatService, Chat],
  controllers: [ChatController],
})
export class ChatModule {
  private logger: Logger = new Logger('ChatModule');
  constructor(
    private readonly chat: Chat,
    private readonly inMemoryUsers: InMemoryUsers,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {}

  public get getInMemoryUsers(): InMemoryUsers {
    return this.inMemoryUsers;
  }
}
