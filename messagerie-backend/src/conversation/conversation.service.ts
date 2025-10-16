import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
    constructor(private prisma: PrismaService) {}

    /**
     * 🔹 Récupère toutes les conversations de l'utilisateur connecté
     * @param clerkId L'identifiant Clerk de l'utilisateur
     */
    async getUserConversations(clerkId: string) {
        // Trouver l'utilisateur via son Clerk ID
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            throw new UnauthorizedException('Utilisateur introuvable');
        }

        // Charger toutes les conversations où il participe
        return this.prisma.conversation.findMany({
            where: {
                users: {
                    some: { userId: user.id },
                },
            },
            include: {
                users: {
                    include: { user: true },
                },
                messages: {
                    include: { author: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * 🔹 Crée une nouvelle conversation
     */
    async createConversation(adminClerkId: string, recipientIds: string[] | string) {
        const ids = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

        if (!ids || ids.length === 0) {
            throw new BadRequestException('Vous devez sélectionner au moins un ami.');
        }

        // Récupérer l'admin (utilisateur courant)
        const admin = await this.prisma.user.findUnique({
            where: { clerkId: adminClerkId },
        });
        if (!admin) {
            throw new UnauthorizedException('Admin introuvable');
        }

        // Récupérer les destinataires
        const recipients = await this.prisma.user.findMany({
            where: { clerkId: { in: ids } },
        });

        if (recipients.length === 0) {
            throw new BadRequestException('Aucun destinataire valide trouvé.');
        }

        const allUserIds = [admin.id, ...recipients.map((r) => r.id)].sort();

        // Vérifie si une conversation avec EXACTEMENT ces utilisateurs existe déjà
        const existingConvs = await this.prisma.conversation.findMany({
            where: {
                AND: allUserIds.map((id) => ({
                    users: { some: { userId: id } },
                })),
            },
            include: { users: true },
        });

        for (const conv of existingConvs) {
            const convUserIds = conv.users.map((u) => u.userId).sort();
            if (
                convUserIds.length === allUserIds.length &&
                convUserIds.every((v, i) => v === allUserIds[i])
            ) {
                throw new BadRequestException('Une conversation avec ces participants existe déjà.');
            }
        }

        const recipientNames = recipients.map((r) => r.name).filter(Boolean);
        const convTitle =
            recipientNames.length > 0
                ? `Conversation avec ${recipientNames.join(', ')}`
                : 'Nouvelle conversation';

        // ✅ Créer la nouvelle conversation
        return this.prisma.conversation.create({
            data: {
                title: convTitle,
                users: {
                    create: [
                        { userId: admin.id, role: 'admin' },
                        ...recipients.map((r) => ({ userId: r.id, role: 'member' })),
                    ],
                },
            },
            include: {
                users: { include: { user: true } },
            },
        });
    }

    /**
     * 🔹 Supprime une conversation (seulement par un admin)
     */
    async deleteConversation(conversationId: string, clerkUserId: string) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });
        if (!user) throw new UnauthorizedException();

        const convUser = await this.prisma.conversationUser.findFirst({
            where: { conversationId, userId: user.id, role: 'admin' },
        });

        if (!convUser) {
            throw new UnauthorizedException("Seul l'admin peut supprimer la conversation.");
        }

        return this.prisma.conversation.delete({ where: { id: conversationId } });
    }

    /**
     * 🔹 Renomme une conversation (seulement par un admin)
     */
    async renameConversation(conversationId: string, clerkUserId: string, title: string) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });
        if (!user) throw new UnauthorizedException();

        const convUser = await this.prisma.conversationUser.findFirst({
            where: { conversationId, userId: user.id, role: 'admin' },
        });

        if (!convUser) {
            throw new UnauthorizedException("Seul l'admin peut renommer la conversation.");
        }

        return this.prisma.conversation.update({
            where: { id: conversationId },
            data: { title },
        });
    }
}
