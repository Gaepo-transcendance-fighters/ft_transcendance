import { UserObject } from 'src/entity/users.entity';
import { Mode } from '../../../entity/chat.entity';
import { Message } from '../chat.message/message.class';

// FIXME: any type 을 적절하게 수정해야함
// FIXME: message -> messages 는 어떤지?
export class Channel {
  /******************************* 멤버 변수 *******************************/
  private channelIdx: number;
  private roomId: number;
  private member: UserObject[] = [];
  private messages: Message[] = [];
  private mode: Mode;
  private owner: UserObject;
  private admin: UserObject[] = [];
  private ban: UserObject[] = [];
  private mute: UserObject[] = [];
  private password: string;
  /******************************* 메서드 *******************************/
  // TODO: 생성자가 필요할 듯 하다.
  // constructor(
  //   channelIdx: number,
  //   roomId: number,
  //   member: any,
  //   messages: Message[],
  //   mode: Mode,
  //   owner: any,
  //   admin: any,
  //   password: string,
  // ) {
  //   this.channelIdx = channelIdx;
  //   this.roomId = roomId;
  //   this.member = member;
  //   this.messages = messages;
  //   this.mode = mode;
  //   this.owner = owner;
  //   this.admin = admin;
  //   this.password = password;
  // }
  // getter
  get getChannelIdx(): number {
    return this.channelIdx;
  }
  get getRoomId(): number {
    return this.roomId;
  }
  get getMember(): UserObject[] {
    return this.member;
  }
  get getMessages(): Message[] {
    return this.messages;
  }
  get getMode(): string {
    return this.mode;
  }
  get getOwner(): UserObject {
    return this.owner;
  }
  get getAdmin(): UserObject[] {
    return this.admin;
  }
  get getBan(): UserObject[] {
    return this.ban;
  }
  get getMute(): UserObject[] {
    return this.mute;
  }
  get getPassword(): string {
    return this.password;
  }

  // setter
  // TODO: 함수 내부에서 에러 처리 해줘야함.
  set setChannelIdx(channelIdx: number) {
    this.channelIdx = channelIdx++;
  }
  set setRoomId(roomId: number) {
    this.roomId = roomId;
  }
  set setMember(member: UserObject) {
    this.member.push(member);
  }
  set setMessage(message: Message) {
    this.messages.push(message);
  }
  set setMode(mode: Mode) {
    this.mode = mode;
  }
  set setOwner(owner: UserObject) {
    this.owner = owner;
  }

  set setAdmin(user: UserObject | null) {
    if (user === null) return;
    const check = this.admin.some((admin) => {
      return admin.userIdx === user.userIdx;
    });
    if (!check)
      this.admin.push(user);
  }

  set setBan(ban: UserObject | null) {
    if (ban !== null) {
      this.ban.push(ban);
    }
  }
  set setMute(mute: UserObject | null) {
    if (mute !== null) {
      this.mute.push(mute);
    }
  }
  set setPassword(password: string) {
    this.password = password;
  }

  // remove
  removeAdmin(admin: UserObject) {
    this.admin?.splice(this.admin.indexOf(admin), 1);
  }
  removeMember(member: UserObject) {
    const userIdx = this.member.findIndex((user) => {
      return member.userIdx === user.userIdx;
    });
    if (userIdx === -1) return;
    this.member?.splice(userIdx, 1);
  }
  removeOwner() {
    this.owner = null;
  }
  removeMute(mute: UserObject) {
    this.mute?.splice(this.mute.indexOf(mute), 1);
  }
}
