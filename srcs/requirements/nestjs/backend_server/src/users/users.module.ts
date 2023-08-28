import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmExModule } from '../typeorm-ex.module';
import { UserObjectRepository } from './users.repository';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { CertificateRepository } from './certificate.repository';
import { UsersGateway } from './users.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { DMChannelRepository } from 'src/chat/DM.repository';
import { SharedModule } from 'src/shared/shared.module';

// @Global()
@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      UserObjectRepository,
      BlockListRepository,
      FriendListRepository,
      CertificateRepository,
      DMChannelRepository,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [UsersService, TypeOrmExModule],
})
export class UsersModule {}
