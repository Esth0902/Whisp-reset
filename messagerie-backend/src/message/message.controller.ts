import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { Request } from 'express';

// On définit une interface typée pour la requête
interface AuthenticatedRequest extends Request {
    clerkUserId?: string;
}

// Optionnel : typage du corps attendu
interface SendMessageDto {
    content: string;
    conversationId: string;
}

@Controller('message')
@UseGuards(ClerkAuthGuard)
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    async sendMessage(@Body() body: SendMessageDto, @Req() req: AuthenticatedRequest) {
        const clerkId = req.clerkUserId;
        if (!clerkId) {
            throw new Error('Clerk ID non trouvé dans le token');
        }

        return this.messageService.sendMessage(clerkId, body);
    }
}
