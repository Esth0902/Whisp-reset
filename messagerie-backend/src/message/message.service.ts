import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class MessageService {
    constructor(
        private prisma: PrismaService,
        private realtime: RealtimeGateway, // 👈 ajout injection socket
    ) {}

    async sendMessage(userClerkId: string, body: any) {
        const { content, conversationId, recipientId } = body;
        let convId = conversationId;

        const author = await this.prisma.user.findUnique({
            where: { clerkId: userClerkId },
        });
        if (!author) throw new Error('Utilisateur non trouvé');

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

        const message = await this.prisma.message.create({
            data: {
                content,
                authorId: author.id,
                conversationId: convId,
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
