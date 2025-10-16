import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    clerkUserId: string;
}

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationController {
    constructor(private prisma: PrismaService) {}

    // Récupérer toutes les notifications de l'utilisateur connecté
    @Get()
    async getMyNotifications(@Req() req: AuthenticatedRequest) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { clerkId: req.clerkUserId },
        });

        return this.prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Marquer une notif comme lue
    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
}
