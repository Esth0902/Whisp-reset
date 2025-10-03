import {Injectable, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
    constructor(private  prisma: PrismaService) {}

    async getUserConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                users: {
                    some: { userId },
                },
            },
            include: {
                messages: {
                    include: { author: true },
                },
                users: {
                    include: { user: true },
                },
            },
        });
    }



    async createConversation(adminClerkId: string, recipientIds: string[]) {

        const admin = await this.prisma.user.findUnique({
            where : {clerkId: adminClerkId},
        })
        if (!admin) {
            throw new UnauthorizedException("Admin introuvable");
        }
        const recipients = await this.prisma.user.findMany({
            where: { clerkId: { in: recipientIds } },
        });

        const convCount = await this.prisma.conversation.count({
            where: { title: null },
        });
        const convTitle = `Nouvelle discussion ${convCount + 1}`;

        return this.prisma.conversation.create(
            {
                data: {
                    title : convTitle,
                    users: {
                        create: [
                            { userId: admin.id, role: "admin" },
                            ...recipients.map((r) => ({ userId: r.id, role: "member" })),
                        ],
                    },
                },
                include: { users: {
                    include:{user:true},
                    },
                },
            });
    }

    async deleteConversation(conversationId: string, clerkUserId: string) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });
        if (!user) throw new UnauthorizedException();

        const convUser = await this.prisma.conversationUser.findFirst({
            where: { conversationId, userId: user.id, role: 'admin' },
        });

        if (!convUser) throw new UnauthorizedException("Seul l'admin peut supprimer");

        return this.prisma.conversation.delete({ where: { id: conversationId } });
    }

    async renameConversation(conversationId: string, clerkUserId: string, title: string) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });
        if (!user) throw new UnauthorizedException();

        const convUser = await this.prisma.conversationUser.findFirst({
            where: { conversationId, userId: user.id, role: 'admin' },
        });

        if (!convUser) throw new UnauthorizedException("Seul l'admin peut renommer");

        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { title },
        });
    }
    }

