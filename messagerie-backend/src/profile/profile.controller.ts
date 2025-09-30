import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { ClerkUserService } from '../clerk/clerk-user.service';

@Controller('profile')
export class ProfileController {
    constructor(private clerkUserService: ClerkUserService) {}

    @UseGuards(ClerkAuthGuard)
    @Get()
    async getProfile(@Req() req) {
        // Récupère ou crée utilisateur avec l'ID Clerk injecté dans la requête
        return this.clerkUserService.getOrCreateUser(req.clerkUserId);
    }
}
