"use client";

export const gameLogOptions = {
  threshold: 0.1,
};

enum type {
  normal,
  rank,
}

export interface IGameLog {
  user1Idx: number;
  user1Nickname: string;
  user1win: number;
  user1lose: number;
  user1rankpoint: number;
  user2Idx: number;
  user2Nickname: string;
  user2win: number;
  user2lose: number;
  user2rankpoint: number;
  score: string; // "score : score" 구조로 전 달함
  winnerIdx: number;
}

export interface IGameRecord {
  matchUserIdx: number;
  matchUserNickname: string;
  score: string;
  type: type;
  result: RecordResult;
}

export enum RecordResult {
  DEFAULT = 0,
  PLAYING,
  WIN,
  LOSE,
  DONE,
  SHUTDOWN,
}

export interface IGameUserInfo {
  lose: number;
  win: number;
  rankpoint: number;
}
