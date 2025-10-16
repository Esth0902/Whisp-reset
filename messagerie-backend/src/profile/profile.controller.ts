import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { ClerkUserService } from '../clerk/clerk-user.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    clerkUserId: string;
}

@Controller('profile')
@UseGuards(ClerkAuthGuard)
export class ProfileController {
    constructor(private clerkUserService: ClerkUserService) {}

    @Get()
    async getProfile(@Req() req: AuthenticatedRequest) {
        // Récupère ou crée utilisateur avec l'ID Clerk injecté dans la requête
        return this.clerkUserService.getOrCreateUser(req.clerkUserId);
    }
}
