import { Controller, Get, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    @Get('me')
    getMyConversations(@Req() req: any) {
        const userId = req.user.id;
        return this.conversationService.getUserConversations(userId);
    }
}