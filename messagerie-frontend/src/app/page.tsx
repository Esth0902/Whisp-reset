'use client';

import {
    useUser,
    useAuth,
    SignedIn,
    SignedOut,
    SignInButton,
} from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function HomePage() {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [syncing, setSyncing] = useState(false); // ⏳ false par défaut
    const [error, setError] = useState<string | null>(null);

    const displayName =
        user?.username?.trim() ||
        user?.firstName?.trim() ||
        user?.fullName?.trim() ||
        'cher utilisateur';

    useEffect(() => {
        async function syncProfile() {
            if (!isSignedIn) return; // 🚨 ne rien faire si pas connecté

            setSyncing(true);
            try {
                const token = await getToken();
                if (!token) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error('Impossible de synchroniser le profil utilisateur');
                }

                setSyncing(false);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
                setSyncing(false);
            }



        }
        syncProfile();
    }, [isSignedIn, getToken]);

    if (error) {
        return (
            <main>
                <p className="text-red-600">
                    Erreur lors de la synchro utilisateur : {error}
                </p>
            </main>
        );
    }

    return (
        <main>
            <SignedOut>
                <p>Vous n’êtes pas connecté.</p>
                <SignInButton>Se connecter</SignInButton>
            </SignedOut>

            <SignedIn>
                {syncing ? (
                    <p className="animate-pulse">Initialisation de votre compte...</p>
                ) : (
                    <p>Bienvenue, {displayName} !</p>
                )}
            </SignedIn>
        </main>
    );
}

