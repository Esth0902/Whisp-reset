import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        const { clerkId } = client.handshake.auth;
        console.log('Client connecté :', client.id, '→ clerkId:', clerkId);

        if (clerkId) {
            client.join(`user:${clerkId}`);
        }
    }

    notifyUser(clerkId: string, event: string, payload: any) {
        console.log(`📤 Envoi ${event} à user:${clerkId}`, payload);
        this.server.to(`user:${clerkId}`).emit(event, payload);
    }
}
