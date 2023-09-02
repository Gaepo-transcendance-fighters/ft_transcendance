import { RecordResult, RecordType } from "src/game/enum/game.type.enum";

export class UserDto {
  userIdx: number;
  displayName: string;
  email: string;
  imgUri: string;
  rating: number;
  mfaNeed: boolean;
};

export class UserEditprofileDto {
  userIdx : number;
  userNickname: string;
  imgData: any;
}

// export class UserEditImgDto {
//   userIdx: number;
//   userNickname : string;
//   imgData: any
// }
export class IntraInfoDto {
  constructor(userIdx: number, intra: string, imgUri: string, token: string, email: string, check2Auth: boolean
  ) {
    this.userIdx = userIdx;
    this.intra = intra;
    this.imgUri = imgUri;
    this.token = token;
    this.email = email;
    this.check2Auth = check2Auth;
  }
  userIdx: number;
  intra: string;
  imgUri: string;
  token: string;
  email: string;
  check2Auth: boolean;
};


/* response body
{
	imgUrl : string,
	rate : string,
	rank : string,
	email : string,
	gameRecord[] {
		record {
			matchUserNickname : string,
			matchUserIdx : number,
			type : enum,
			result : enum
			score : string, // OO : OO 로 저장됨
			matchDate : Date 
		},
		...
	}
}
*/
export class ProfileResDto {
  nickname: string;
  imgUrl: string;
  win: number;
  lose: number; 
  rank: number;
  email: string;
}
export class GameRecordDto {
  matchUserNickname : string;
  matchUserIdx : number;
  type : RecordType;
  result : RecordResult;
  score : string; // OO : OO 로 저장됨
  matchDate : Date;
}