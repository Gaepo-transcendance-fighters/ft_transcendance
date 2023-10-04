import { Repository } from 'typeorm';
import { GameRecord } from 'src/entity/gameRecord.entity';
import { GameChannel } from 'src/entity/gameChannel.entity';
import { CustomRepository } from 'src/typeorm-ex.decorator';

@CustomRepository(GameChannel)
export class GameChannelRepository extends Repository<GameChannel> {}
