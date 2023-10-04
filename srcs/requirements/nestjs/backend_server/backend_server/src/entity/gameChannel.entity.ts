import {
  BaseEntity,
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { GameRecord } from './gameRecord.entity';
import { UserObject } from './users.entity';
import { RecordType, RecordResult } from 'src/game/enum/game.type.enum';

@Entity('game_channel')
export class GameChannel extends BaseEntity {
  @PrimaryGeneratedColumn()
  gameIdx: number;

  @Column({ type: 'enum', enum: RecordType })
  type: RecordType;

  @Column({ nullable: true})
  matchDate: Date;

  @Column({ type: 'int' })
  userIdx1: number;

  @Column({ type: 'int' })
  userIdx2: number;

  @Column({ type: 'smallint' })
  score1: number;

  @Column({ type: 'smallint' })
  score2: number;

  @Column({ type: 'enum', enum: RecordResult })
  status: RecordResult;

  @ManyToOne(() => UserObject, (user1) => user1.userGameChannelList)
  @JoinColumn([{ name: 'userIdx1', referencedColumnName: 'userIdx' }])
  user1: UserObject;

  @ManyToOne(() => UserObject, (user2) => user2.userGameChannelList)
  @JoinColumn([{ name: 'userIdx2', referencedColumnName: 'userIdx' }])
  user2: UserObject;

  @OneToMany(() => GameRecord, (record) => record.gameIdx)
  records: GameRecord[];
}
