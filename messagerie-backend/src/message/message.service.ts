import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) {}

    async sendMessage(userId: string, body: any) {
        const { content, conversationId, recipientId } = body;
        let convId = conversationId;

        if (!convId && recipientId) {
            const existing = await this.prisma.conversation.findFirst({
                where:{users:{some:{userId},},},
            });

            if (existing) {
                convId = existing.id;
            }
            else {const newConv = await this.prisma.conversation.create({

                data: {
                    users: {
                        create: [
                            { userId,role: 'admin' },
                            { userId: recipientId, role:'member'},
                        ],
                    },
                },
            });
                convId = newConv.id;
        }
    }

        const user = await this.prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (!user) throw new Error("Utilisateur non trouvé");


        return this.prisma.message.create({
            data: {
                content,
                authorId: user.id,
                conversationId: convId,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        clerkId: true,
                    },
                },
            },
                });
    }
}
