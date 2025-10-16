import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type SendMessageDto = {
    content: string;
    conversationId?: string;
    recipientId?: string;
};

@Injectable()
export class MessageService {
    constructor(
        private prisma: PrismaService,
        private realtime: RealtimeGateway,
    ) {}

    async sendMessage(userClerkId: string, body: SendMessageDto) {
        const { content, conversationId, recipientId } = body;
        let convId: string | null = conversationId ?? null;

        const author = await this.prisma.user.findUnique({
            where: { clerkId: userClerkId },
        });
        if (!author) throw new Error('Utilisateur non trouvé');

        // Si pas d'ID de conversation, on en crée une
        if (!convId && recipientId) {
            const existing = await this.prisma.conversation.findFirst({
                where: {
                    users: { some: { user: { clerkId: recipientId } } },
                },
                include: { users: true },
            });

            if (existing) {
                convId = existing.id;
            } else {
                const recipient = await this.prisma.user.findUnique({
                    where: { clerkId: recipientId },
                });
                if (!recipient) throw new Error('Destinataire introuvable');

                const newConv = await this.prisma.conversation.create({
                    data: {
                        users: {
                            create: [
                                { userId: author.id, role: 'admin' },
                                { userId: recipient.id, role: 'member' },
                            ],
                        },
                    },
                });
                convId = newConv.id;
            }
        }

        if (!convId) {
            throw new Error('Impossible de déterminer la conversation cible.');
        }

        const message = await this.prisma.message.create({
            data: {
                content,
                authorId: author.id,
                conversationId: convId, // ✅ garanti d’être défini ici
            },
            include: {
                author: { select: { name: true, clerkId: true } },
            },
        });

        const participants = await this.prisma.conversationUser.findMany({
            where: { conversationId: convId },
            include: { user: { select: { clerkId: true, id: true, name: true } } },
        });

        for (const participant of participants) {
            if (participant.user.clerkId === userClerkId) continue;

            await this.prisma.notification.create({
                data: {
                    type: 'message.new',
                    message: `💬 Nouveau message de ${author.name ?? author.clerkId}`,
                    userId: participant.user.id,
                },
            });

            this.realtime.notifyUser(participant.user.clerkId, 'message.new', {
                from: author.name ?? author.clerkId,
                fromClerkId: author.clerkId,
                conversationId: convId,
                content,
            });
        }

        return message;
    }
}
