import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameRecordRepository } from './game.record.repository';
import { GameChannelRepository } from './game.channel.repository';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
// import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/shared/shared.module';
import { GameController } from './game.controller';
import { GamePlayService } from './game.play/game.play.service';

@Module({
  imports: [
    // TypeOrmModule.forFeature([GameRecordRepository, GameChannelRepository]),
    TypeOrmExModule.forCustomRepository([
      GameRecordRepository,
      GameChannelRepository,
    ]),
    SharedModule,
  ],
  controllers: [GameController],
  providers: [GameGateway, GameService],
  exports: [GameModule, SharedModule],
})
export class GameModule {}
