import { Controller, Post, Body, Req} from '@nestjs/common';
import { MessageService} from "./message.service";
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';

@Controller('message')
@UseGuards(ClerkAuthGuard)
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    sendMessage(@Body() body : any, @Req() req : any) {
        const clerkId = req.clerkUserId;
        if (!clerkId) throw new Error("Clerk ID non trouvé dans le token");

        return this.messageService.sendMessage(clerkId, body);
    }
}