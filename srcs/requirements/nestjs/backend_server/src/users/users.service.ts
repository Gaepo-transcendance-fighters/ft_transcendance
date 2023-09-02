import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserObjectRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { BlockInfoDto, BlockTargetDto } from './dto/block-target.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { FollowFriendDto, FriendListResDto } from './dto/friend.dto';
import axios from 'axios';
import { response } from 'express';
import {
  CreateCertificateDto,
  IntraSimpleInfoDto,
  JwtPayloadDto,
} from 'src/auth/dto/auth.dto';
import { Socket } from 'socket.io';
import { CertificateRepository } from './certificate.repository';
import { OnlineStatus, UserObject } from '../entity/users.entity';
import { CertificateObject } from '../entity/certificate.entity';
import { FriendList } from '../entity/friendList.entity';
import { DataSource } from 'typeorm';
import {
  IntraInfoDto,
  UserEditprofileDto,
} from './dto/user.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { DMChannelRepository } from 'src/chat/DM.repository';
import { BlockList } from 'src/entity/blockList.entity';
import { InMemoryUsers } from './users.provider';
import { MailerService } from '@nestjs-modules/mailer';
import * as config from 'config';
import { SendEmailDto, TFAUserDto, TFAuthDto } from './dto/tfa.dto';
import * as fs from 'fs/promises'; // fs.promises를 사용하여 비동기적인 파일 처리
import { LoggerWithRes } from 'src/shared/class/shared.response.msg/shared.response.msg';

const mailConfig = config.get('mail');
const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';
@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    private userObjectRepository: UserObjectRepository,
    private blockedListRepository: BlockListRepository,
    private friendListRepository: FriendListRepository,
    private certificateRepository: CertificateRepository,
    private readonly mailerService: MailerService,
  ) { }

  private messanger: LoggerWithRes = new LoggerWithRes('UsersService');

  async findOneUser(userIdx: number): Promise<UserObject> {
    return this.userObjectRepository.findOneBy({ userIdx });
  }

  async updateUserNick(updateUsersDto: UserEditprofileDto) {
    const { userIdx, userNickname, imgData } = updateUsersDto;
    const user = await this.userObjectRepository.findOneBy({ userIdx });
    if (!user) { throw new BadRequestException('유저가 존재하지 않습니다.'); }
    // 존재하는 닉네임인지 확인
    const isNicknameExist = await this.userObjectRepository.findOneBy({ nickname: userNickname });
    if (!isNicknameExist) { // 닉네임이 존재하지 않는다면
      user.nickname = userNickname;
      return await this.userObjectRepository.save(user);
    } else { return false; } // 닉네임이 이미 존재한다면
  }

  private async createDirectoryIfNotExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log('Directory created successfully:', dirPath);
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  private async checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      console.log('File exists:', filePath);
      return true;
    } catch (error) {
      console.log('File does not exist:', filePath);
      return false;
    }
  }



  async updateImgFile(filepath: string, filename: string, imgData: string) {
    if (imgData === '') return;
    // imgUri를 저장할 경로를 만들고 그 안에 이미지 파일을 생성해야 함.
    const base64 = imgData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const fileExtension = 'png'; // 이미지 데이터의 확장자 동적으로 결정

    const completeFilePath = `${filepath}/${filename}.${fileExtension}`; // 완전한 파일 경로 생성
    const fileExists = await this.checkFileExists(completeFilePath);
  
    if (fileExists) {
      await fs.unlink(completeFilePath); // 파일이 존재한다면 삭제
    }

    const directoryPath = 'public/img';
    await this.createDirectoryIfNotExists(directoryPath);

    try {
      await fs.writeFile(completeFilePath, buffer); // 비동기적으로 파일 저장
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }

  /*
  filepath: string, filename: string, imgData: any
  */
  async updateUser(userEditImgDto: UserEditprofileDto): Promise<any> {
    const { userIdx, userNickname, imgData } = userEditImgDto;
  
    const user = await this.findOneUser(userIdx);
    if (userNickname !== '') {
      user.nickname = userNickname;
      try {
        await this.updateUserNick({ userIdx, userNickname: userNickname, imgData: user.imgUri });
      } catch (err) {
        throw new HttpException('update user error', HttpStatus.FORBIDDEN);
      }
    } else {
      await this.updateImgFile(`public/img`, `${userIdx}`, imgData); // 이미지 파일 비동기 저장
    }
    
    return user;
  }
  
  async saveToken(
    createCertificateDto: CreateCertificateDto,
  ): Promise<CertificateObject> {
    try {
      const beforeSaveToken = await this.certificateRepository.findOneBy({
        userIdx: createCertificateDto.userIdx,
      });
      // 없다면
      if (!beforeSaveToken) {
        return await this.certificateRepository.save(createCertificateDto);
      } else {
        // 있다면 다른지
        if (beforeSaveToken.token != createCertificateDto.token) {
          await this.certificateRepository.update(
            beforeSaveToken.userIdx,
            createCertificateDto,
          );
          // 다르다면 업데이트
          return await this.certificateRepository.findOneBy({
            userIdx: createCertificateDto.userIdx,
          });
        } else {
          return beforeSaveToken;
        } // 같다면 그대로
      }
    } catch (e) { console.log("토큰 디비에 문제가 있다."); throw new InternalServerErrorException(e); }
  };

  async setBlock(
    targetNickname: string,
    user: UserObject,
    inMemory: InMemoryUsers,
  ): Promise<BlockInfoDto[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const blockInfo = await this.blockedListRepository.blockTarget(
        targetNickname,
        user,
        this.userObjectRepository,
      );
      // check inmemory
      const checkTarget = await this.blockedListRepository.findOne({
        where: {
          userIdx: user.userIdx,
          blockedNickname: targetNickname,
        },
      });
      if (!checkTarget) {
        inMemory.removeBlockListByNicknameFromIM(targetNickname);
      } else {
        inMemory.setBlockListByIdFromIM(blockInfo);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return;
    } finally {
      await queryRunner.release();
    }
    const blockList = inMemory.getBlockListByIdFromIM(user.userIdx);
    const blockInfoList: BlockInfoDto[] = blockList.map((res) => {
      return {
        userNickname: res.blockedNickname,
        userIdx: res.blockedUserIdx,
      };
    });
    return blockInfoList;
  }

  async checkBlockList(
    user: UserObject,
    inMemory: InMemoryUsers,
    target: UserObject,
  ): Promise<boolean> {
    //  inmemory 에서 가져오기
    // jaekim 이 jeekim 을 차단, jeekim 이 jaekim 에게 문자
    const blockList = inMemory.getBlockListByIdFromIM(target.userIdx);
    const check = blockList.find((res) => res.blockedUserIdx === user.userIdx);
    if (check) return true;
    else return false;
  }

  async findUserByIntra(intra: string): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { intra: intra } });
  }
   /*
    export class FriendListResDto {
      FriendDto[] {
        frindNickname : string;
        friendIdx : number;
        isOnline : boolean;
      },,,{}
    } 
  */
  async addFriend(
    insertFriendDto: FollowFriendDto,
    user: UserObject,
  ): Promise<FriendListResDto> {
    const target = await this.userObjectRepository.findOneBy({userIdx: insertFriendDto.targetIdx});
    const list = await this.friendListRepository.insertFriend(
      insertFriendDto,
      user,
      this.userObjectRepository,
    );
    const updatedList: FriendListResDto = list.map((res) => ({
      friendNickname: res.friendNickname,
      friendIdx: res.friendIdx,
      isOnline: target.isOnline, // 여기서 user.isOnline 값을 추가
    }));
    return updatedList;
    
  }

  async deleteFriend(
    deleteFriendDto: FollowFriendDto,
    user: UserObject,
  ): Promise<FriendList[]> {
    return this.friendListRepository.deleteFriend(
      deleteFriendDto,
      user,
      this.userObjectRepository,
    );
  }

  async createUser(intraInfo: IntraInfoDto): Promise<UserObject> {
    const { userIdx, intra, imgUri, email } = intraInfo;

    let user = this.userObjectRepository.create({
      userIdx: userIdx,
      intra: intra,
      nickname: intra,
      imgUri: `http://localhost:4000/img/${userIdx}.png`,
      rankpoint: 0,
      isOnline: OnlineStatus.ONLINE,
      available: true,
      win: 0,
      lose: 0,
      email: email,
      check2Auth: false
    });
    user = await this.userObjectRepository.save(user);
    return user;
  }
  
  async validateUser(intraInfo: IntraInfoDto): Promise<IntraSimpleInfoDto> {
    let user = await this.createUser(intraInfo);
    return new IntraSimpleInfoDto(user.userIdx, user.imgUri, user.check2Auth);
  }

  async getAllUsersFromDB(): Promise<UserObject[]> {
    return this.userObjectRepository.find();
  }

  async getUserInfoFromDB(intra: string): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { intra: intra } });
  }

  async getUserInfoFromDBById(userId: number): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { userIdx: userId } });
  }

  async getAllBlockedListFromDB() {
    return await this.blockedListRepository.find();
  }

  async getFriendList(
    intra: string,
  ): Promise<{ friendNickname: string; friendIdx: number; isOnline: OnlineStatus }[]> {
    const user: UserObject = await this.userObjectRepository.findOne({
      where: { intra: intra },
    });
    return this.friendListRepository.getFriendList(
      user.userIdx,
      this.userObjectRepository,
    );
  }

  async setIsOnline(user: UserObject, isOnline: OnlineStatus) {
    user.isOnline = isOnline;
    return this.userObjectRepository.setIsOnline(user, isOnline);
  }

  async getUserObjectFromDB(idValue: number): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { userIdx: idValue } });
  }

  // async getUserId(client: Socket): Promise<number> {
  //   return parseInt(client.handshake.query.userId as string, 10);
  // }
  private mailCodeList: Map<number, number> = new Map();

  async reqTFA(sendEmailDto: SendEmailDto) {
    const { userIdx, email } = sendEmailDto;
    // 난수를 생성한다. 6자리 숫자
    const authCode = Math.floor(Math.random() * 900000 + 100000);
    this.mailCodeList.set(userIdx, authCode);
    console.log('authCode :', authCode);
    // 3분 후 만료된다.
    setTimeout(() => {
      this.mailCodeList.delete(userIdx);
    }, 3 * 60000);
    await this.mailerService
      .sendMail({
        to: email,
        from: 'no-reply <no-reply@gaepofighters.com>',
        subject: '[gaepofighters] 2차 인증 코드',
        text: `인증 코드: ${authCode}`,
        html: `<b>인증 코드: ${authCode}</b>`,
      })
      .then((success) => {
        console.log('Mail sent: ' + success.response);
        return success;
      })
      .catch((err) => {
        console.log('Error occured: ' + err);
        throw new BadRequestException();
      });
  }

  async getTFA(userIdx: number): Promise<TFAUserDto> {
    const authenticated = await this.certificateRepository.findOneBy({ userIdx });
    if (!authenticated) throw new NotFoundException('Not Found User.');
    return { checkTFA: authenticated.check2Auth };
  }
  // tfa 를 사용하는지 안 하는지, 그리고 한다고 하면 그 때 2차 인증에 대해서 인증이 된 유저인지 확인이 필요함. 
  // check2Auth (2차 인증 사용 여부), checkTFA (2차 인증 사용 유저가 인증을 성공했을 때)
  async patchTFA(
    userIdx: number,
    patchAuthDto: TFAuthDto,
  ): Promise<TFAUserDto> {
    const auth = await this.userObjectRepository.findOneBy({ userIdx });
    const { code } = patchAuthDto;
    console.log(this.mailCodeList, code);

    if (code !== undefined || auth.check2Auth === false) {
      if (this.mailCodeList.get(userIdx) !== code || code === undefined)
        throw new BadRequestException('Invalid or Expired.');
      this.mailCodeList.delete(userIdx);
      if (auth.check2Auth === true) return { checkTFA: true };
    }
    auth.check2Auth = !auth.check2Auth;
    const user = await this.userObjectRepository.save(auth);
    return { checkTFA: user.check2Auth };
  }
}
