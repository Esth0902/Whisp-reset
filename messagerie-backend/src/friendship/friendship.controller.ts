import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { RespondFriendshipDto } from './dto/respond-friendship.dto';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { Request } from 'express';

// On définit une interface typée pour les requêtes authentifiées
interface AuthenticatedRequest extends Request {
    clerkUserId?: string;
}

@UseGuards(ClerkAuthGuard)
@Controller('friendships')
export class FriendshipController {
    constructor(private friendshipService: FriendshipService) {}

    @Post()
    async sendInvitation(@Req() req: AuthenticatedRequest, @Body() createDto: CreateFriendshipDto) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.friendshipService.sendInvitation(userId, createDto.friendName);
    }

    @Patch(':id/respond')
    async respondInvitation(@Param('id') id: string, @Body() respondDto: RespondFriendshipDto) {
        return this.friendshipService.respondInvitation(id, respondDto.status);
    }

    @Get('friends')
    async getFriends(@Req() req: AuthenticatedRequest) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.friendshipService.getFriends(userId);
    }

    @Get('invitations')
    async getPendingInvitations(@Req() req: AuthenticatedRequest) {
        const userId = req.clerkUserId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        return this.friendshipService.getPendingInvitations(userId);
    }
}
