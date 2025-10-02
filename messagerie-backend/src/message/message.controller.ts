import { Controller, Post, Body, Req} from '@nestjs/common';
import { MessageService} from "./message.service";

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    sendMessage(@Body() body : any, @Req() req : any) {
        const userId = req.user.id;
        return this.messageService.sendMessage(userId, body);
    }
}