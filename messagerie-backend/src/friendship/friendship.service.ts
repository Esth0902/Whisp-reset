import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class FriendshipService {
    constructor(
        private prisma: PrismaService,
        private realtime: RealtimeGateway, // 👈 injection
    ) {}

    // Résoudre clerkId en User.id
    private async resolveUserIdByClerkId(clerkId: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            throw new NotFoundException(
                `Utilisateur avec ClerkId ${clerkId} introuvable.`,
            );
        }
        return user.id;
    }

    // Résoudre name en User.id
    private async resolveUserIdByName(name: string): Promise<string> {
        const user = await this.prisma.user.findUnique({ where: { name } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec name ${name} introuvable.`);
        }
        return user.id;
    }

    // Envoyer une invitation d’ami
    async sendInvitation(requesterClerkId: string, friendName: string) {
        const requesterId = await this.resolveUserIdByClerkId(requesterClerkId);
        const friendId = await this.resolveUserIdByName(friendName);

        if (requesterId === friendId) {
            throw new BadRequestException(
                "Vous ne pouvez pas vous inviter vous-même.",
            );
        }

        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: requesterId, friendId },
                    { userId: friendId, friendId: requesterId },
                ],
            },
        });

        if (existing) {
            throw new BadRequestException(
                'Une demande existe déjà ou vous êtes déjà amis.',
            );
        }

        const invitation = await this.prisma.friendship.create({
            data: {
                userId: requesterId,
                friendId,
                status: 'pending',
            },
            include: {
                user: { select: { clerkId: true, name: true } },   // l’émetteur
                friend: { select: { clerkId: true, name: true } }, // le destinataire
            },
        });

        console.log("➡️ Envoi notif à", invitation.friend.clerkId);

        this.realtime.notifyUser(invitation.friend.clerkId, 'friendship.requested', {
            id: invitation.id,
            from: invitation.user.name ?? invitation.user.clerkId,
        });

        return invitation;
    }

    // Répondre à une invitation (accepter/refuser)
    async respondInvitation(
        friendshipId: string,
        status: 'accepted' | 'declined',
    ) {
        const friendship = await this.prisma.friendship.findUnique({
            where: { id: friendshipId },
            include: {
                user: { select: { clerkId: true, name: true } },
                friend: { select: { clerkId: true, name: true } },
            },
        });

        if (!friendship) {
            throw new NotFoundException('Invitation introuvable.');
        }
        if (friendship.status !== 'pending') {
            throw new BadRequestException("L'invitation a déjà été traitée.");
        }

        let result;
        if (status === 'accepted') {
            result = await this.prisma.friendship.update({
                where: { id: friendshipId },
                data: { status: 'accepted' },
            });
        } else {
            result = await this.prisma.friendship.delete({
                where: { id: friendshipId },
            });
        }

        // 🔔 Notif au demandeur
        this.realtime.notifyUser(friendship.user.clerkId, 'friendship.responded', {
            id: friendship.id,
            status,
            by: friendship.friend.name ?? friendship.friend.clerkId,
        });

        return result;
    }

    // Lister amis confirmés
    async getFriends(userClerkId: string) {
        const userId = await this.resolveUserIdByClerkId(userClerkId);

        const friendships = await this.prisma.friendship.findMany({
            where: {
                status: 'accepted',
                OR: [{ userId }, { friendId: userId }],
            },
            include: {
                user: { select: { clerkId: true, name: true } },
                friend: { select: { clerkId: true, name: true } },
            },
        });

        return friendships.map((f) =>
            f.userId === userId ? f.friend : f.user,
        );
    }

    // Lister invitations reçues
    async getPendingInvitations(userClerkId: string) {
        const userId = await this.resolveUserIdByClerkId(userClerkId);

        return this.prisma.friendship.findMany({
            where: { friendId: userId, status: 'pending' },
            include: {
                user: { select: { clerkId: true, name: true } },
            },
        });
    }
}
