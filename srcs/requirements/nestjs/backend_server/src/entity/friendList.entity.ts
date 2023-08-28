import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserObject } from './users.entity';

@Entity('friend_list')
export class FriendList extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'int' })
  userIdx: number;

  @Column({ type: 'int' })
  friendIdx: number;

  @Column({ type: 'varchar' })
  friendNickname: string;

  @ManyToOne(() => UserObject, (listOnwer) => listOnwer)
  @JoinColumn({ name: 'userIdx', referencedColumnName: 'userIdx' }) // 관계된 것을 적을 수 없고, 관계성을 반드시 지정해줘야 하니 JoinColumn 이 필수임
  listOnwer: UserObject;
}
