import { Module } from '@nestjs/common';
import { ClerkUserService } from './clerk-user.service';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [ClerkUserService, ClerkAuthGuard],
    exports: [ClerkUserService, ClerkAuthGuard],
})
export class ClerkModule {}
