import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserObject } from './users.entity';

@Entity('block_list')
export class BlockList extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'int', onUpdate: 'CASCADE' })
  userIdx: number;

  @Column({ type: 'int', onUpdate: 'CASCADE' })
  blockedUserIdx: number;

  @Column({ type: 'varchar', onUpdate: 'CASCADE' })
  blockedNickname: string;

  @CreateDateColumn() // 해당 컬럼은 자동으로 입력됨.
  blockedTime: Date;

  @ManyToOne(() => UserObject, (userIdx) => userIdx.blockedList)
  @JoinColumn({ name: 'userIdx', referencedColumnName: 'userIdx' })
  blockOwner: UserObject;
}
