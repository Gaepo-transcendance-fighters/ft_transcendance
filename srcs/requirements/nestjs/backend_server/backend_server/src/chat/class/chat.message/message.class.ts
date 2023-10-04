// FIXME: get, set 을 여기에 두는게 좋을까?
// Channel에 두는게 좋을까 ?
export class Message {
  /******************************* 멤버 변수 *******************************/
  private channelIdx: number;
  private sender: number;
  private message: string;
  private msgDate: string;

  /******************************* 메서드 *******************************/
  constructor(channelIdx: number, sender: number, message: string) {
    this.channelIdx = channelIdx;
    this.sender = sender;
    this.message = message;
  }

  // getter
  get getChannelIdx(): number {
    return this.channelIdx;
  }
  get getSender(): number {
    return this.sender;
  }
  get getMessage(): string {
    return this.message;
  }
  get getMsgDate(): string {
    return this.msgDate;
  }

  // setter
  // set setChannelInfo(channelIdx: number, sender: number, message: string) {
  // FIXME: Dto 만들기
  // set setChannelInfo(chatInfo: chatDTO) {
  set setChannelInfo(chatInfo: any) {
    // this.setChannelIdx(chatInfo.channelIdx);
    // this.setChannelIdx(chatInfo.channelIdx);
    // this.setSender = sender;
  }
  set setChannelIdx(channelIdx: number) {
    this.channelIdx = channelIdx;
  }
  set setSender(sender: number) {
    this.sender = sender;
  }
  set setMsgDate(msgDate: string) {
    this.msgDate = msgDate;
  }
  // get getMessage(): string {
  //   return this.message;
  // }
  // set setMessage(message: string) {
  //   this.message = message;
  // }
}
