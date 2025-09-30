import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getAllUsers() {
        return this.prisma.user.findMany();
    }

    async searchUsers(query: string) {
        if (!query || query.trim().length < 2) return [];

        return this.prisma.user.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                clerkId: true,
                name: true,
            },
            take: 10,
        });
    }
}
