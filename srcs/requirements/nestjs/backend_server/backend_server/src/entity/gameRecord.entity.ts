import { UserObject } from './users.entity';
import {
  BaseEntity,
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { GameChannel } from './gameChannel.entity';
import { RecordType, RecordResult } from 'src/game/enum/game.type.enum';

@Entity('game_record')
export class GameRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'int', unique: false })
  gameIdx: number;

  @Column({ type: 'int' })
  userIdx: number;

  @Column({ type: 'varchar' })
  matchUserNickname: string;

  @Column({ type: 'int' })
  matchUserIdx: number;

  @Column({ type: 'enum', enum: RecordType })
  type: RecordType;

  @Column({ type: 'enum', enum: RecordResult })
  result: RecordResult;

  @Column()
  score: string;

  @CreateDateColumn()
  matchDate: Date;

  @ManyToOne(() => UserObject, (matchUser) => matchUser)
  @JoinColumn([{ name: 'matchUserIdx', referencedColumnName: 'userIdx' }])
  matchUser: UserObject;

  @ManyToOne(() => GameChannel, (channel) => channel.records)
  @JoinColumn([{ name: 'gameIdx', referencedColumnName: 'gameIdx' }])
  channel: GameChannel;

  @ManyToOne(() => UserObject, (historyUser) => historyUser.userRecordList)
  @JoinColumn([{ name: 'userIdx', referencedColumnName: 'userIdx' }])
  historyUser: UserObject;
}
