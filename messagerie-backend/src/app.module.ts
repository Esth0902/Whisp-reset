import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule} from "./user/user.module";
import { ClerkModule } from './clerk/clerk.module';
import { ProfileModule } from './profile/profile.module';
import { FriendshipModule } from './friendship/friendship.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [PrismaModule, UserModule, ClerkModule, ProfileModule, FriendshipModule, RealtimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

