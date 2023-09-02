import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/img/:imageName')
  getImage(@Param('imageName') imageName: string, @Res() res: any) {
    const imagePath = path.join(__dirname, '..', 'public', 'img', imageName);
    res.sendFile(imagePath);
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
