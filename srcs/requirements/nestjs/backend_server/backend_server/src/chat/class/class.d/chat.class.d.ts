import { Channel } from './channel.class';

declare class Chat {
  /******************************* 변수 *******************************/
  private protectedChannels: Channel[];
  private privateChannels: Channel[];
  static idxForChannel: number;

  /******************************** 메서드 ********************************/
  // Promise 는 비동기처리를 위한 것이므로, 이를 사용하는 것은 가독성을 해친다.
  constructor(protectedChannels: Channel[], privateChannels: Channel[]);
  get getProtectedChannels(): Channel[];
  get getPrivateChannels(): Channel[];
  set setProtectedChannels(protectedChannels: Channel[]);
  set setPrivateChannels(privateChannels: Channel[]);

  // FIXME: 반환값이 필요한가?
  removeChannel(channelIdx: number): void;
}
