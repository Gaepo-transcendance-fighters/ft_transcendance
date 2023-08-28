import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from 'src/login/login.service';

@Injectable()
export class AuthService {
  constructor() {}
  verify(jwtString: string): any { // 검증 하기 위한 메서드
    try {
      const payload: JwtPayloadDto = jwt.verify(jwtString, jwtSecret) as (
        | jwt.JwtPayload
        | string
      ) &
        JwtPayloadDto;
      return payload;
    } catch (error) {
      console.log(`auth.service: extractPayload: ${error}`);
      // 토큰이 유효하지 않은 경우 등 에러 처리
      return null;
    }
  }

  validateRequest(request: Request): boolean | JwtPayloadDto {
    const token = request.headers.authorization;
    if (token === undefined || token === null) {
      console.log(`auth.guard: invalid user`);
      return false;
    }
    const jwtString = token.split('Bearer ')[1];
    const payload = this.verify(jwtString);
    (request as any).jwtPayload = payload;
    console.log("auth.service: validateRequest: true");
    console.log("auth.service: validateRequest: payload", payload);
    return payload;
  }

  validateSocket(client: Socket): boolean | JwtPayloadDto {
    const token = this.getToken(client);
    if (token === undefined || token === null) {
      console.log(`auth.guard: invalid user`);
      return false;
    }
    this.verify(token as string);
    return this.verify(token as string);;
  }

  private getToken(client: Socket) {
    const { token } = client.handshake.auth;
    return token;
  }  
}