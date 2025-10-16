import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { RespondFriendshipDto } from './dto/respond-friendship.dto';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';

@UseGuards(ClerkAuthGuard)
@Controller('friendships')
export class FriendshipController {
    constructor(private friendshipService: FriendshipService) {}

    @Post()
    async sendInvitation(@Req() req, @Body() createDto: CreateFriendshipDto) {
        return this.friendshipService.sendInvitation(req.clerkUserId, createDto.friendName);
    }

    @Patch(':id/respond')
    async respondInvitation(@Param('id') id: string, @Body() respondDto: RespondFriendshipDto) {
        return this.friendshipService.respondInvitation(id, respondDto.status);
    }

    @Get('friends')
    async getFriends(@Req() req) {
        return this.friendshipService.getFriends(req.clerkUserId);
    }

    @Get('invitations')
    async getPendingInvitations(@Req() req) {
        return this.friendshipService.getPendingInvitations(req.clerkUserId);
    }
}
