import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameRecordRepository } from './game.record.repository';
import { GameChannelRepository } from './game.channel.repository';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
// import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/shared/shared.module';
import { GameController } from './game.controller';
// import { InMemoryUsers } from 'src/users/users.provider';
import { GameResultController } from './game.controller';

@Module({
  imports: [
    // TypeOrmModule.forFeature([GameRecordRepository, GameChannelRepository]),
    TypeOrmExModule.forCustomRepository([
      GameRecordRepository,
      GameChannelRepository,
    ]),
    SharedModule,
  ],
  providers: [GameGateway, GameService],
  controllers: [GameController, GameResultController],
  exports: [
    TypeOrmExModule.forCustomRepository([
      GameRecordRepository,
      GameChannelRepository,
    ]),
  ],
})
export class GameModule {}
