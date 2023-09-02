import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  // public readonly messages: ChatMessage[] = generateMockData();

  // MAIN_CHAT_INFINITY
  @Get('messages')
  getMessages(
    @Query('channelIdx') channelIdx: number,
    @Query('msgDate') msgDate: string,
  ) {
    console.log("프론트에서받은 마지막 메세지데이트",msgDate);
    return this.chatService.getChatMessagesByInfinity(channelIdx, msgDate);
  }
}
