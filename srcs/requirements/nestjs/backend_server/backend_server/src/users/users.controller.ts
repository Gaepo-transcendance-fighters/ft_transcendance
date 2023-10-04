import {
  Controller,
  ValidationPipe,
  Post,
  Body,
  BadRequestException,
  Redirect,
  Get,
  Res,
  Query,
  Logger,
  UseGuards,
  Headers,
  HttpStatus,
  Req,
  Put,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { plainToClass } from 'class-transformer';
import { UserObject } from '../entity/users.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserEditprofileDto, ProfileResDto } from './dto/user.dto';
import { SendEmailDto, TFAUserDto, TFAuthDto } from './dto/tfa.dto';
import { FollowFriendDto } from './dto/friend.dto';
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UserStatusDto } from 'src/chat/dto/update-chat.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  logger: Logger = new Logger('UsersController');
  messanger: LoggerWithRes = new LoggerWithRes('UsersController');

  @UseGuards(AuthGuard)
  @Get('profile')
  async getUserProfile(@Req() req, @Res() res: Response, @Body() body: any) {
    // body 를 안 쓰긴 함.
    const { id: userIdx, email } = req.jwtPayload;
    try {
      const user = await this.usersService.findOneUser(userIdx);
      const userProfile: ProfileResDto = {
        nickname: user.nickname,
        imgUrl: user.imgUri,
        win: user.win,
        lose: user.lose,
        rankpoint: user.rankpoint,
        email: email,
        check2Auth: user.check2Auth,
      };
      this.messanger.setResponseMsg(200, 'ok');
      return res.status(HttpStatus.OK).json(userProfile);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  @UseInterceptors(FileInterceptor('imgData'))
  async updateUserProfile(
    @Req() req,
    @Res() res: Response,
    @Body() body: any,
    @UploadedFile() imgData: Express.Multer.File,
  ) {
    try {
      const { id: myIdx, email } = req.jwtPayload;
      const changedUser = body;
      changedUser.userIdx = Number(body.userIdx);
      if (myIdx !== changedUser.userIdx) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: '잘못된 접근입니다.' });
      }
      // console.log('changedUser : ', changedUser);
      const result = await this.usersService.updateUser(changedUser);
      const userStatusDto: UserStatusDto = {
        isOnline: result.isOnline,
        check2Auth: result.check2Auth,
        nickname: result.nickname,
      };

      if (result) {
        // console.log('success result :', result);
        // console.log('userStatusDto :', userStatusDto);
        return res
          .status(HttpStatus.OK)
          .json({ message: '유저 정보가 업데이트 되었습니다.', result });
      } else
        return res
          .status(HttpStatus.OK)
          .json({ message: '이미 존재하는 유저 닉네임입니다.' });
    } catch (err) {
      this.logger.error(err);
      return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  }

  @UseGuards(AuthGuard)
  @Get(':userIdx/second')
  async getTFA(@Param('userIdx') userIdx: number) {
    return this.usersService.getTFA(userIdx);
  }

  @UseGuards(AuthGuard)
  @Post('second')
  async sendEmail(@Req() req, @Res() res, @Body() body: any) {
    try {
      // console.log('sendEmail');
      // console.log(body);
      const sendEmailDto: SendEmailDto = {
        userIdx: body.userIdx,
        email: body.email,
      };
      await this.usersService.reqTFA(sendEmailDto);
    } catch (err) {
      this.logger.error(err);
      return { message: err.message };
    }
    return res
      .status(HttpStatus.OK)
      .json({ message: '인증번호가 전송되었습니다.', result: true });
  }

  @UseGuards(AuthGuard)
  @Patch('profile/second')
  async userTFA(@Req() req, @Res() res: Response, @Body() body: any) {
    const { userIdx, check2Auth } = body;

    // console.log('userTFA', userIdx, check2Auth);
    const result = await this.usersService.patchUserTFA(userIdx, check2Auth);
    // console.log('result', result);
    return res
      .status(HttpStatus.OK)
      .json({ message: '유저 정보가 업데이트 되었습니다.', result });
  }

  @UseGuards(AuthGuard)
  @Patch('second')
  async patchTFA(@Req() req, @Res() res: Response, @Body() body: any) {
    const tfaAuthDto: TFAuthDto = { code: body.code };
    const result = await this.usersService.patchTFA(body.userIdx, tfaAuthDto);
    if (result.checkTFA) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '유저 정보가 업데이트 되었습니다.', result });
    } else {
      return res
        .status(HttpStatus.OK)
        .json({ message: '인증번호가 일치하지 않습니다.', result });
    }
  }

  @UseGuards(AuthGuard)
  @Post('follow')
  async followFriend(
    @Req() req,
    @Res() res: Response,
    @Body() body: FollowFriendDto,
  ) {
    // const { myIdx, targetNickname, targetIdx } = req.jwtPayload;
    const userIdx = body.myIdx;
    const myUser = await this.usersService.findOneUser(userIdx);
    const result = await this.usersService.addFriend(body, myUser);
    // console.log('res', result);
    return res.status(HttpStatus.OK).json({ result });
  }

  @UseGuards(AuthGuard)
  @Delete('unfollow')
  async unfollowFriend(
    @Req() req,
    @Res() res: Response,
    @Body() body: FollowFriendDto,
  ) {
    // const { myIdx, targetNickname, targetIdx } = req.jwtPayload;
    const userIdx = body.myIdx;
    // logic
    const myUser = await this.usersService.findOneUser(userIdx);
    const result = await this.usersService.deleteFriend(body, myUser);
    return res.status(HttpStatus.OK).json({ result });
  }
}
