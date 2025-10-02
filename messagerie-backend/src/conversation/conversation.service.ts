import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
    constructor(private prisma: PrismaService) {}

    async getUserConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                users: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                messages: {
                    include: {
                        author: true,
                    },
                },
            },
        });
    }}
