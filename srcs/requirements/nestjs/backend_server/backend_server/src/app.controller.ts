import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import * as fs from 'fs/promises'; // fs.promises를 사용하여 비동기적인 파일 처리

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/img/:imageName')
  async getImage(@Param('imageName') imageName: string, @Res() res: any) {
    const imagePath = path.join(__dirname, '..', 'public', 'img', imageName);
    try {
      await fs.access(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      // console.log(error);
      const imagePath = path.join(__dirname, '..', 'public', 'img', '0.png');
      res.status(201).sendFile(imagePath);
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
