'use client';

import {
    useUser,
    useAuth,
    SignedIn,
    SignedOut,
    SignInButton,
} from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import Pricing from '@/component/pricing';
import Link from "next/link";

export default function HomePage() {
    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayName =
        user?.username?.trim() ||
        user?.firstName?.trim() ||
        user?.fullName?.trim() ||
        'cher utilisateur';

    useEffect(() => {
        async function syncProfile() {
            if (!isSignedIn) return;
            setSyncing(true);
            try {
                const token = await getToken();
                if (!token) return;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Impossible de synchroniser le profil utilisateur');
                setSyncing(false);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : String(err));
                setSyncing(false);
            }
        }
        void syncProfile();
    }, [isSignedIn, getToken]);

    if (error) {
        return (
            <main className="p-6">
                <p className="text-red-600 text-center">
                    Erreur lors de la synchronisation : {error}
                </p>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-white text-gray-800">
            {/* Hero Section */}
            <section className="text-center bg-gradient-to-br from-blue-50 to-white">
                <h1 className="text-5xl font-extrabold mb-2">Votre messagerie moderne et sécurisée</h1>
                <p className="text-lg text-gray-600 mb-4">
                    Communiquez facilement avec vos amis, collègues ou clients. Simple, rapide et privé.
                </p>

                <SignedOut>
                    <Link
                        href="/sign-up"
                        className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
                    >
                        🚀 Essayez gratuitement dès maintenant

                    </Link>
                </SignedOut>

                <SignedIn>
                    {syncing ? (
                        <p className="text-gray-500 animate-pulse">Chargement de votre espace personnel...</p>
                    ) : (
                        <p className="text-xl font-medium">Bienvenue, {displayName} 👋</p>
                    )}
                </SignedIn>
            </section>

            {/* Section offres uniquement si non connecté */}
            <SignedOut>
                <Pricing />
            </SignedOut>
        </main>
    );
}
