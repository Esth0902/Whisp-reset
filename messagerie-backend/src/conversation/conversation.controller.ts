import {Controller, Get, Req, Post, Body, Delete,Param,Patch, UnauthorizedException} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';

@Controller('conversations')
@UseGuards(ClerkAuthGuard)
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    @Get('me')
    getMyConversations(@Req() req: any) {
        return this.conversationService.getUserConversations(req.ClerkUserId);
    }

    @Post()
    async createConversation(
        @Body() dto: { recipientIds: string[] },
        @Req() req: any,
    ) {
        return this.conversationService.createConversation(req.clerkUserId, dto.recipientIds);
    }

    @Delete(':id')
    async deleteConversation(@Param('id') id: string, @Req() req: any) {
        return this.conversationService.deleteConversation(id, req.clerkUserId);
    }

    @Patch(':id')
    async renameConversation(
        @Param('id') id: string,
        @Body('title') title: string,
        @Req() req: any,)
    {return this.conversationService.renameConversation(id, req.clerkUserId, title);
    }}