"use client";

import { IOnlineStatus } from "./type";

export const myProfileStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "75vw",
  height: "80%",
  bgcolor: "#65d9f9",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

export interface IUserData {
  available: boolean;
  check2Auth: boolean;
  createdAt: string;
  nickname: string;
  imgUri: string;
  win: number;
  lose: number;
  email: string;
  intra: string;
  isOnline: IOnlineStatus;
  rankpoint: number;
  updatedAt: string;
  userIdx: number;
}

export const secondAuthModalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  height: 150,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
