import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule} from "./user/user.module";
import { ClerkModule } from './clerk/clerk.module';
import { ProfileModule } from './profile/profile.module';
import { FriendshipModule } from './friendship/friendship.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import {PrismaService} from "./prisma/prisma.service";
import {MessageGateway} from "./message/message.gateway";

@Module({
  imports: [PrismaModule, UserModule, ClerkModule, ProfileModule, FriendshipModule, RealtimeModule, MessageModule, ConversationModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, MessageGateway],
    exports: [PrismaService],
})
export class AppModule {}

