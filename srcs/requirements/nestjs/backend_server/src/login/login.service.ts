import { HttpException, HttpStatus, Injectable, Logger, } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';

import { UserObject } from 'src/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as config from 'config';

const authConfig = config.get('auth');


export const apiUid = authConfig.clientid;
export const apiSecret = authConfig.clientsecret;
export const redirectUri = authConfig.redirecturi;
export const frontcallback = authConfig.frontcallbackuri;
export const callbackuri = authConfig.callbackuri;
export const jwtSecret = authConfig.secret;

export const intraApiTokenUri = 'https://api.intra.42.fr/oauth/token';
export const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
  ) {}
  private logger: Logger = new Logger('LoginService');

  async getAccessToken(code: string): Promise<any> {
    this.logger.log(`getAccessToken : code= ${code}`);
    const body = {
      grant_type: 'authorization_code',
      client_id: apiUid,
      client_secret: apiSecret,
      code: code,
      redirect_uri: frontcallback,
    };
    console.log( "body : ",body);
    try {
      const response = await axios.post(intraApiTokenUri, body);
      this.logger.log(`getAccessToken: response.data.access_token : ${response.data.access_token}`)
      return response.data.access_token;
    } catch (error) {
      // Handle error
      console.error('Error making POST request:', error.message);
      throw error;
    }
  }

  async getIntraInfo(code: string): Promise<IntraInfoDto> {

    const token = await this.getAccessToken(code);
    try {
      const response = await axios.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const userInfo = response.data;
    
    return {
      userIdx: userInfo.id,
      intra: userInfo.login,
      imgUri: userInfo.image.versions.small,
      token : token,
      email: userInfo.email,
      check2Auth: false,
    };
    } catch (error) {
      // 에러 핸들링
      console.error('Error making GET request:', error);
    }
  }

  async issueToken(payload: JwtPayloadDto) {
    const paytoken = jwt.sign(payload, jwtSecret);
    
    this.logger.log('paytoken', paytoken);
    return paytoken;
  }
}