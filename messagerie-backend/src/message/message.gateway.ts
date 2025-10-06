import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessageGateway {
    @WebSocketServer()
    server: Server;

    constructor(private prisma: PrismaService) {}

    // Quand un utilisateur rejoint une conversation
    @SubscribeMessage('joinConversation')
    handleJoin(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
        client.join(conversationId); // il rejoint la "room" de cette conversation
    }

    // Quand un message est envoyé
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: { conversationId: string; content: string; clerkUserId: string },
    ) {
        // Sauvegarde en base
        const user = await this.prisma.user.findUnique({
            where: { clerkId: data.clerkUserId },
        });
        if (!user) return;

        const message = await this.prisma.message.create({
            data: {
                content: data.content,
                conversationId: data.conversationId,
                authorId: user.id,
            },
            include: { author: true },
        });

        // Envoie à tous les membres de la conversation
        this.server.to(data.conversationId).emit('newMessage', message);
    }
}
