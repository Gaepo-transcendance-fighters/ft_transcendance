import { Repository } from 'typeorm';
import { GameRecord } from 'src/entity/gameRecord.entity';
import { CustomRepository } from 'src/typeorm-ex.decorator';

@CustomRepository(GameRecord)
export class GameRecordRepository extends Repository<GameRecord> {}
