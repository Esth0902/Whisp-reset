import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeModule } from '../realtime/realtime.module';
import {PrismaModule} from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule, RealtimeModule],
    providers: [FriendshipService, PrismaService],
    controllers: [FriendshipController],
})
export class FriendshipModule {}
