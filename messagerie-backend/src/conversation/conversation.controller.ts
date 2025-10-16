import { Controller, Get, Req, Post, Body, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    clerkUserId?: string;
}

@Controller('conversations')
@UseGuards(ClerkAuthGuard)
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    @Get('me')
    getMyConversations(@Req() req: AuthenticatedRequest) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.conversationService.getUserConversations(userId);
    }

    @Post()
    async createConversation(
        @Body() dto: { recipientIds: string[] },
        @Req() req: AuthenticatedRequest,
    ) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.conversationService.createConversation(userId, dto.recipientIds);
    }

    @Delete(':id')
    async deleteConversation(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.conversationService.deleteConversation(id, userId);
    }

    @Patch(':id')
    async renameConversation(
        @Param('id') id: string,
        @Body('title') title: string,
        @Req() req: AuthenticatedRequest,
    ) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.conversationService.renameConversation(id, userId, title);
    }
}
