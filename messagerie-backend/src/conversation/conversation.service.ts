import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
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

        if (!recipientIds || recipientIds.length === 0) {
            throw new BadRequestException("Vous devez sélectionner au moins un ami.");
        }
        const admin = await this.prisma.user.findUnique({
            where : {clerkId: adminClerkId},
        })
        if (!admin) {
            throw new UnauthorizedException("Admin introuvable");
        }
        const recipients = await this.prisma.user.findMany({
            where: { clerkId: { in: recipientIds } },
        });

        const allUserIds = [admin.id, ...recipients.map(r => r.id)].sort();

        // Vérifier si une conversation avec exactement les mêmes participants existe
        const existingConvs = await this.prisma.conversation.findMany({
            where: {
                AND: allUserIds.map(id => ({
                    users: { some: { userId: id } }
                }))
            },
            include: { users: true }
        });

        for (const conv of existingConvs) {
            const convUserIds = conv.users.map(u => u.userId).sort();
            if (convUserIds.length === allUserIds.length && convUserIds.every((v, i) => v === allUserIds[i])) {
                throw new BadRequestException("Une conversation avec ces participants existe déjà");
            }
        }

        const recipientNames = recipients.map(r => r.name).filter(Boolean);
        const convTitle = `Conversation avec ${recipientNames.join(', ')}`;

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

