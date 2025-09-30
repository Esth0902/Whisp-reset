import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { users } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkUserService {
    constructor(private prisma: PrismaService) {}

    async getOrCreateUser(clerkUserId: string) {
        let user = await this.prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (!user) {
            const clerkUser = await users.getUser(clerkUserId);

            const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? 'unknown@example.com';
            const username = clerkUser.username?.trim() || 'Unknown';

            user = await this.prisma.user.create({
                data: {
                    clerkId: clerkUserId,
                    email,
                    name: username,
                },
            });
        }

        return user;
    }
}
