"use client";
//TODO : 파일명 작명 규칙 알아보고 적용

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
  admin: { nickname: string }[];
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
  leftMember: IMember[];
  owner: string;
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
  message: IDMChatFromServer[]
  totalMsgCount : number,
  channelIdx: number; 
  userIdx1: number;
  userIdx2: number;
  userNickname1: string;
  userNickname2: string;
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

export interface ILeftMember {
  userNickname: string;
  userIdx: number;
  imgUri: string;
}

export interface ReturnMsgDto {
  code: number,
  msg: string,
}

export interface IDMChatFromServer {
  msg: string,
  msgDate: string,
  sender: string, // 원래는 IDX하기로했는데 백엔드 로직상 dm에서만 string
}