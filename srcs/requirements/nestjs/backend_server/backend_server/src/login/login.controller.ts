import {
  Controller,
  Post,
  Get,
  Headers,
  Res,
  Req,
  Query,
  Redirect,
  Body,
  UseGuards,
  Logger,
  Header,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginService } from './login.service';
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { plainToClass } from 'class-transformer';
import { CertificateObject } from 'src/entity/certificate.entity';
import { OnlineStatus, UserObject } from 'src/entity/users.entity';
import { IntraSimpleInfoDto, JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';
const backenduri = process.env.BACKEND;

@Controller()
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly usersService: UsersService,
  ) { }

  private logger: Logger = new Logger('LoginController');
  private messanger: LoggerWithRes = new LoggerWithRes('LoginController');

  @Post('login/auth')
  async codeCallback(
    @Headers('token') authHeader: any,
    @Req() req: Request,
    @Res() res: Response,
    @Body() query: any,
  ) {
    try {
      this.logger.log(`codeCallback code : ${query.code}`);
      if (!authHeader) {
        authHeader = req.headers.token;
      } else {
        authHeader = authHeader.startsWith('Bearer')
          ? authHeader.split(' ')[1]
          : req.headers.token;
      }
      let intraInfo: IntraInfoDto;
      let intraSimpleInfoDto: IntraSimpleInfoDto;
      intraInfo = await this.loginService.getIntraInfo(query.code);
      const user = await this.usersService.findOneUser(intraInfo.userIdx);

      if (!user) {
        intraSimpleInfoDto = await this.usersService.validateUser(intraInfo);
        this.loginService.downloadProfileImg(intraInfo);
      } else {
        user.imgUri = `${backenduri}/img/${user.userIdx}.png`
        this.usersService.setUserImg(user.userIdx, user.imgUri);
        intraSimpleInfoDto = new IntraSimpleInfoDto(user.userIdx, user.nickname, user.imgUri, user.check2Auth, user.available);
      }
      const anyImg = await this.usersService.checkFileExists(`public/img/${intraSimpleInfoDto.userIdx}.png`);
      if (!anyImg && !intraSimpleInfoDto.imgUri) {
        intraSimpleInfoDto.imgUri = `${backenduri}/img/0.png`;
        await this.usersService.setUserImg(intraSimpleInfoDto.userIdx, intraSimpleInfoDto.imgUri);
      }
      const payload = { id: intraInfo.userIdx, email: intraInfo.email };
      const jwt = await this.loginService.issueToken(payload);
      intraInfo.token = (jwt).toString();
      intraInfo.check2Auth = intraSimpleInfoDto.check2Auth;
      intraInfo.imgUri = intraSimpleInfoDto.imgUri;
      intraInfo.nickname = intraSimpleInfoDto.nickname;
      intraInfo.available = intraSimpleInfoDto.available;
      const userOnline = await this.usersService.findOneUser(intraInfo.userIdx)
      this.usersService.setIsOnline(userOnline, OnlineStatus.ONLINE);

      res.cookie('authorization', intraInfo.token, { httpOnly: true, path: '*' });
      res.header('Cache-Control', 'no-store');
      return res.status(200).json(intraInfo);
    } catch (err) {
      this.logger.error(err);
      return res.status(400).json({ message: "다시 시도해주세요." });
    }
  }


  @Get('logout')
  async logout(@Res() res: Response): Promise<void> {
    this.logger.log('logout');
    await this.usersService.initServerUsers();
    res.status(200).json({ message: '로그아웃 되었습니다.' });
  }
}
