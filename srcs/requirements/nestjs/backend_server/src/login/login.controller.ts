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
import { UserObject } from 'src/entity/users.entity';
import { IntraSimpleInfoDto, JwtPayloadDto } from 'src/auth/dto/auth.dto';

@Controller()
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly usersService: UsersService,
  ) {}

  private logger: Logger = new Logger('LoginController');

  @Post('login/auth')
  async codeCallback(
    @Headers('token') authHeader: any,
    @Req() req: Request,
    @Res() res: Response,
    @Body() query: any,
  ) {
    this.logger.log(`codeCallback code : ${query.code}`);
    console.log('authHeader', authHeader);
    if (!authHeader) {
      authHeader = req.headers.token;
    } else {
      authHeader = authHeader.startsWith('Bearer')
        ? authHeader.split(' ')[1]
        : req.headers.token;
      console.log('codeCallback token : ', authHeader);
    }
    // let intraInfo: IntraInfoDto;
    // let intraSimpleInfoDto: IntraSimpleInfoDto;
    const intraInfo: IntraInfoDto = await this.loginService.getIntraInfo(
      query.code,
    );
    console.log(`codeCallback intraInfo : `, intraInfo);
    // const user = await this.usersService.findOneUser(intraInfo.userIdx);
    // if (!user)
    const intraSimpleInfoDto: IntraSimpleInfoDto =
      await this.usersService.validateUser(intraInfo);
    // else
    //   intraSimpleInfoDto = new IntraSimpleInfoDto(user.userIdx, user.imgUri, user.check2Auth);
    console.log(`codeCallback intraSimpleInfoDto : `, intraSimpleInfoDto);
    const payload = { id: intraInfo.userIdx, email: intraInfo.email };
    const jwt = await this.loginService.issueToken(payload);
    intraInfo.token = jwt.toString();

    res.cookie('authorization', (await jwt).toString(), {
      httpOnly: true,
      path: '*',
    });

    console.log(`codeCallback intraInfo : `, intraInfo);

    console.log('success');

    return res.status(200).json(intraInfo);
  }

  @Post('logout')
  @Header('Set-Cookie', 'Authentication=; Path=/; HttpOnly; Max-Age=0')
  logout() {
    this.logger.log('logout');
    return { message: '로그아웃 되었습니다.' };
  }
}
