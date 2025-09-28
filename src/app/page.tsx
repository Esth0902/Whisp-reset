'use client';

import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
    const { user } = useUser();

    const displayName =
        user?.username?.trim() ||
        user?.firstName?.trim() ||
        user?.fullName?.trim() ||
        'cher utilisateur';

    return (
        <main>
            <SignedOut>
                <p>Vous n’êtes pas connecté.</p>
                <SignInButton>Se connecter</SignInButton>
            </SignedOut>

            <SignedIn>
                <p>Bienvenue, {displayName}!</p>
            </SignedIn>
        </main>
    );
}
