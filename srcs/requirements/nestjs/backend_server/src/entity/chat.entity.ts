// import { channel } from 'diagnostics_channel';
import { UserObject } from './users.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';

export enum Mode {
  PRIVATE = 'private',
  PUBLIC = 'public',
  PROTECTED = 'protected',
}

@Entity('direct_message_members')
export class DMChannel extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  userIdx1: number;

  @Column()
  userIdx2: number;

  @Column()
  userNickname1: string;

  @Column()
  userNickname2: string;

  @Column()
  channelIdx: number;

  @OneToMany(
    () => DirectMessage,
    (targetMessageList) => targetMessageList.targetMessage,
  )
  targetMessageList: DirectMessage[];

  @ManyToOne(() => UserObject, (channelOwner) => channelOwner.dmChannelList)
  @JoinColumn({ name: 'userIdx1', referencedColumnName: 'userIdx' })
  channelOwner: UserObject;

  @OneToOne(() => UserObject, (user1) => user1)
  user1: UserObject;

  @OneToOne(() => UserObject, (user2) => user2)
  user2: UserObject;
}

@Entity('direct_message')
export class DirectMessage extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  idx: number;

  @Column()
  channelIdx: number;

  @Column({ type: 'varchar' })
  sender: string;

  @Column({ type: 'text', nullable: true })
  msg: string;

  @Column()
  msgDate: string;

  @ManyToMany(() => DMChannel, (targetMessage) => targetMessage.channelIdx)
  @JoinColumn({ name: 'channelIdx', referencedColumnName: 'channelIdx' })
  targetMessage: DMChannel;
}
