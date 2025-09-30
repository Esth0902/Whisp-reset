import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];

        console.log('Authorization header:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('Missing or malformed Authorization header');
            throw new UnauthorizedException('Missing or malformed Authorization header');
        }

        const token = authHeader.split(' ')[1];
        console.log('Token extracted:', token);

        try {
            const payload = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY!,
                issuer: process.env.CLERK_ISSUER!,
            });
            console.log('Token successfully verified:', payload);

            if (!payload.sub) {
                console.warn('Token payload missing subject (sub)');
                throw new UnauthorizedException('Invalid token payload');
            }

            req.clerkUserId = payload.sub;

            return true;
        } catch (err) {
            console.error('Token verification failed:', err);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
