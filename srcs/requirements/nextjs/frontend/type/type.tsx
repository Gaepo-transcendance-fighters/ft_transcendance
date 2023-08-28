"use client";

import { ILeftMember } from "@/components/main/room_list/Room";

export const main = {
  main0: "#67DBFB",
  main1: "#55B7EB",
  main2: "#4292DA",
  main3: "#2C70DD",
  main4: "#265ECF",
  main5: "#214C97",
  main6: "#183C77",
  main7: "#48a0ed",
  main8: "#64D9F9",
};

export enum Permission {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export enum Mode {
  PRIVATE = "private",
  PUBLIC = "public",
  PROTECTED = "protected",
}

// export interface IChatRoom {
//   channelIdx: number;
//   owner: string;
//   mode: Mode;
// }

export interface IFriend {
  friendNickname: string;
  isOnline: boolean;
}

export interface IBlock {
  targetNickname: string;
  targetIdx: number;
}

export interface IUserObject {
  imgUri: string;
  nickname: string;
  userIdx: number;
}

export interface IMaindata {
  channelList: IChatRoom[];
  friendList: IFriend[];
  blockList: IBlock[];
  userObject: IUserObject;
}

export interface IMember {
  userIdx: number | undefined;
  nickname: string | undefined;
  imgUri: string | undefined;
  permission?: Permission | undefined;
}

export interface IChatRoom {
  owner: string;
  targetNickname?: string;
  channelIdx: number;
  mode: Mode;
}

export interface IChatEnter {
  member: IMember[];
  channelIdx: number;
  admin: { nickname: string }[];
}

export interface IChatEnterNoti {
  member: IMember[];
  newMember: string;
  admin : { nickname: string }[];
}

export interface IChatRoomAdmin {
  userIdx: number;
  grant: boolean;
  admin: { nickname: string }[];
}

export interface IChatGetRoom {
  owner?: string;
  targetNickname?: string;
  channelIdx: number;
  mode: Mode;
}

export interface IChatRoomExit {
    leftMember : IMember[];
    owner : string
}

export interface IChatGetRoomList {
  channels: IChatRoom[];
}

export interface IChatMute {
  targetNickname: string;
  targetIdx: number;
  mute: boolean;
}

export interface IChatKick {
  targetNickname: string;
  targetIdx: number;
  leftMember: ILeftMember[];
  // leftMember: IMember[];
}

export interface IDmMemList {
  userIdx1: number;
  userIdx2: number;
  userNickname1: string;
  userNickname2: string;
  // channelIdx: number;
  imgUri: string;
}

export interface IChatDmEnter {
  // Message[] {
  // 	message {
  // 		sender : string,
  // 		msg : string
  // 	},
  // 	...
  // }, 이 부분은 주전님이 타입 정해주세요
  // channelIdx : number; currentRoom이 있어서 필요성을 느끼지 못하지만,
  //  이 부분도 필요하시면 주석해제하시고요!

  userIdx1: number;
  userIdx2: number;
  userNickname1: string;
  userNickname2: string;
  // channelIdx: number;
  imgUri: string;
}

export const alert = {
  position: "absolute" as "absolute",
  top: "90%",
  right: "2%",
  fontSize: "16px",
};

export const lock = {
  height: "13px",
  color: "#afb2b3",
};

export const clickedLock = {
  height: "13px",
  color: "rgba(255, 255, 255, 0.294)",
};
