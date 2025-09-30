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
        console.log('Client connecté :', client.id);

        // Auth simplifiée : on récupère clerkId depuis le handshake
        const { clerkId } = client.handshake.auth;
        if (clerkId) {
            client.join(`user:${clerkId}`);
            console.log(`Client ${client.id} rejoint la room user:${clerkId}`);
        }
    }

    // Envoi d'une notification à un utilisateur
    notifyUser(clerkId: string, event: string, payload: any) {
        this.server.to(`user:${clerkId}`).emit(event, payload);
    }
}
