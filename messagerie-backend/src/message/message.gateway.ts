import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class MessageGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly messageService: MessageService) {}

    @SubscribeMessage('joinConversation')
    handleJoin(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
        client.join(conversationId);
        console.log(`👥 Client ${client.id} rejoint la conv ${conversationId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: { conversationId: string; content: string; clerkUserId: string },
    ) {
        try {
            const message = await this.messageService.sendMessage(data.clerkUserId, {
                content: data.content,
                conversationId: data.conversationId,
            });

            this.server.to(data.conversationId).emit('newMessage', message);

            console.log(`💬 Message envoyé dans conv ${data.conversationId} par ${data.clerkUserId}`);
        } catch (error) {
            console.error('❌ Erreur dans handleMessage:', error);
            client.emit('error', { message: 'Erreur lors de l’envoi du message' });
        }
    }
}
