import {
  Injectable,
  ArgumentMetadata,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw new WsException(e.getResponse());
      }
      throw e;
    }
  }
}
