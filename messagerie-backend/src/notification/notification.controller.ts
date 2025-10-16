import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    clerkUserId: string;
}

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationController {
    constructor(private readonly prisma: PrismaService) {}


    @Get()
    async getUnread(@Req() req: AuthenticatedRequest) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { clerkId: req.clerkUserId },
        });

        return this.prisma.notification.findMany({
            where: {
                userId: user.id,
                read: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }


    @Patch('mark-read')
    async markAllAsRead(@Req() req: AuthenticatedRequest) {
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { clerkId: req.clerkUserId },
        });

        await this.prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true },
        });

        return { success: true };
    }
}
