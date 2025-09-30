import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { RespondFriendshipDto } from './dto/respond-friendship.dto';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';

@UseGuards(ClerkAuthGuard)
@Controller('friendships')
export class FriendshipController {
    constructor(private friendshipService: FriendshipService) {}

    // Envoyer une invitation
    @Post()
    async sendInvitation(@Req() req, @Body() createDto: CreateFriendshipDto) {
        // req.clerkUserId est le clerkId de l'utilisateur connecté
        return this.friendshipService.sendInvitation(req.clerkUserId, createDto.friendName);
    }

    // Répondre à une invitation
    @Patch(':id/respond')
    async respondInvitation(@Param('id') id: string, @Body() respondDto: RespondFriendshipDto) {
        return this.friendshipService.respondInvitation(id, respondDto.status);
    }

    // Lister amis confirmés
    @Get('friends')
    async getFriends(@Req() req) {
        return this.friendshipService.getFriends(req.clerkUserId);
    }

    // Lister invitations en attente reçues
    @Get('invitations')
    async getPendingInvitations(@Req() req) {
        return this.friendshipService.getPendingInvitations(req.clerkUserId);
    }
}
