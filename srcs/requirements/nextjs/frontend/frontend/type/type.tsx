"use client";

import { createTheme } from "@mui/material";
import { IChatRoom } from "./RoomType";

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

export enum SpeedOption {
  speed1,
  speed2,
  speed3,
}

export enum MapOption {
  map1,
  map2,
  map3,
}

export interface IGameOption {
  gameType: GameType; // FRIED, NORMAL, RANK
  userIdx: number;
  speed: SpeedOption; //NORMAL, FAST, FASTER
  mapNumber: MapOption; // A, B, C
}

export enum GameType {
  FRIEND,
  NORMAL,
  RANK,
}

export interface IFriend {
  friendNickname: string;
  friendIdx: number;
  isOnline: IOnlineStatus;
}

export interface IFriendData {
  targetNickname: string;
  imgUri: string;
  rank: number;
  win: number;
  lose: number;
  isOnline: IOnlineStatus;
}

export interface FriendReqData {
  myIdx: number;
  targetNickname: string;
  targetIdx: number;
}

export enum IOnlineStatus {
  ONLINE,
  OFFLINE,
  GAMEING,
}

export interface IUserObject {
  imgUri: string;
  nickname: string;
  userIdx: number;
}

export interface IMaindata {
  channelList: IChatRoom[];
  dmChannelList: IChatRoom[];
  friendList: IFriend[];
  blockList: IBlock[];
  userObject: IUserObject;
}

export interface ICor {
  x: number;
  y: number;
}

export interface IPaddle extends ICor {}

export interface IBall extends ICor {}

export const friendProfileModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  height: 700,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const blockProfileModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export interface IBlock {
  blockedNickname: string;
  blockedUserIdx: number;
}

export interface IChatBlock {
  blockInfo: IBlock[];
  friendList: IFriend[];
}

export interface IChat {
  channelIdx: number | undefined;
  senderIdx: number | undefined;
  sender?: string;
  msg: string;
  msgDate: string;
}

export const font = createTheme({
  typography: {
    fontFamily: "neodgm",
  },
});

export interface user_status {
  nickname: string;
  userIdx: number;
  isOnline: IOnlineStatus;
}

export interface IOnGame {
  nickname: string;
  userIdx: number;
  isOnline: IOnlineStatus;
}
