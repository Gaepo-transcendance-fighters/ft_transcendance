import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsersService } from './users.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { FollowFriendDto } from './dto/friend.dto';
import { WsExceptionFilter } from 'src/ws.exception.filter';
import { WsValidationPipe } from 'src/ws.exception.pipe';
import { AuthGuard } from 'src/auth/auth.guard';

@WebSocketGateway({
  namespace: 'users',
  cors: {
    origin: ['http://paulryu9309.ddns.net:3000', 'http://localhost:3000'],
  },
})
@UseFilters(new WsExceptionFilter())
@UsePipes(new WsValidationPipe())
export class UsersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly usersService: UsersService) {}

  private logger: Logger = new Logger('UsersGateway');

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('[ Users ] Initialized');
  }
  handleConnection(client: Socket) {
    console.log(`[ Users ] Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`[ Users ] Client disconnected: ${client.id}`);
  }
  // @SubscribeMessage('add_friend')
  //   async handleAddFriend(
  //     @ConnectedSocket() client: Socket,
  //     @MessageBody() req: FollowFriendDto,
  // ) {
  //     const { myIdx, targetNickname, targetIdx } = req;
  //     console.log('req', req);
      
  //     // logic
  //     const myUser = await this.usersService.findOneUser(myIdx);
  //     const res = await this.usersService.addFriend(req, myUser);
  //     console.log('res', res);
  //     client.emit('add_friend', res);
  // }

  // @SubscribeMessage('delete_friend')
  // async handleDeleteFriend(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() req: FollowFriendDto,
  // ) {
  //     const { myIdx, targetNickname, targetIdx } = req;
  //     // logic
  //     const myUser = await this.usersService.findOneUser(myIdx);
  //     const res = await this.usersService.deleteFriend(req, myUser);
  //     client.emit('delete_friends', res);
  //   }
}
