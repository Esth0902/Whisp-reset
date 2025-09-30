import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ClerkModule } from '../clerk/clerk.module';

@Module({
    imports: [ClerkModule],
    controllers: [ProfileController],
})
export class ProfileModule {}
