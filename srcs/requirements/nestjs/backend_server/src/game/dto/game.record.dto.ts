import { RecordResult, RecordType } from "../enum/game.type.enum";

export class UserProfileGameRecordDto {
    userInfo : UserRecordInfoDto;
    gameList : UserProfileGameDto[];
}
  
export class UserRecordInfoDto {
    win: number;
    lose: number;
}
export class UserProfileGameDto {
    matchUserIdx : number;
    matchUserNickname : string;
    score: string;
    type : RecordType;
    result : RecordResult;
}