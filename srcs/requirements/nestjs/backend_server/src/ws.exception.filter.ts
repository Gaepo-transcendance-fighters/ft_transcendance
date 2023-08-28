import { ArgumentsHost, HttpException, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let properException: WsException;
    if (exception instanceof HttpException) {
      properException = new WsException(exception.getResponse());
    } else {
      properException = new WsException('websocket error exception');
    }
    super.catch(properException, host);
  }
}
