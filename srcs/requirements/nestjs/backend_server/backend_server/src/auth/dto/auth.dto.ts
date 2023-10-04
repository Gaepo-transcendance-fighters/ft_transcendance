export class IntraSimpleInfoDto {
  constructor(userIdx: number, nickname: string, imgUri: string, check2Auth: boolean, available: boolean) {
    this.userIdx = userIdx;
    this.nickname = nickname;
    this.imgUri = imgUri;
    this.check2Auth = check2Auth;
    this.available = available;
  }
    userIdx : number;
    nickname: string;
    imgUri: string;
    check2Auth: boolean;
    available: boolean;
  }
export class JwtPayloadDto {
  id: number;
  email: string;
};

export class CreateCertificateDto {
  constructor(userIdx: number, token: string, check2Auth: boolean, email: string) {
    this.userIdx = userIdx;
    this.token = token;
    this.check2Auth = check2Auth;
    this.email = email;
  }
  userIdx: number;
  token: string;
  check2Auth: boolean;
  email: string;
};