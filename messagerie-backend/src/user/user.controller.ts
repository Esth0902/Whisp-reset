import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // 🔹 Liste complète
    @UseGuards(ClerkAuthGuard)
    @Get()
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    // 🔹 Recherche (auto-complétion)
    @UseGuards(ClerkAuthGuard)
    @Get('search')
    async searchUsers(@Query('query') query: string) {
        return this.userService.searchUsers(query);
    }
}
