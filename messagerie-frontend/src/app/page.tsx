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

                if (!res.ok) {
                    throw new Error('Impossible de synchroniser le profil utilisateur');
                }

                setSyncing(false);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : String(err));
                setSyncing(false);
            }
        }
        syncProfile();
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
        <main className="min-h-screen bg-white text-gray-800">
            {/* Hero Section */}
            <section className="text-center py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
                <h1 className="text-5xl font-extrabold mb-4">Votre messagerie moderne et sécurisée</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Communiquez facilement avec vos amis, collègues ou clients. Simple, rapide et privé.
                </p>

                <SignedOut>
                    <SignInButton>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition">
                            🚀 Essayez gratuitement dès maintenant
                        </button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    {syncing ? (
                        <p className="text-gray-500 animate-pulse">Chargement de votre espace personnel...</p>
                    ) : (
                        <p className="text-xl font-medium">Bienvenue, {displayName} 👋</p>
                    )}
                </SignedIn>
            </section>

            {/* Pricing Section */}
            <section className="py-16 px-6 bg-white">
                <h2 className="text-4xl font-bold text-center mb-12">Nos offres</h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <div className="border rounded-xl p-8 shadow-sm hover:shadow-md transition">
                        <h3 className="text-2xl font-semibold mb-2">Free</h3>
                        <p className="text-gray-500 mb-6">Parfait pour commencer</p>
                        <ul className="space-y-3 text-gray-700 text-sm">
                            <li>✔️ 100 messages / mois</li>
                            <li>✔️ 10 Mo de pièces jointes</li>
                            <li>✔️ Jusqu’à 3 membres / conversation</li>
                            <li>✔️ Rétention des messages : 7 jours</li>
                        </ul>
                        <p className="mt-6 text-2xl font-bold">Gratuit</p>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-blue-600 rounded-xl p-8 shadow-lg bg-blue-50">
                        <h3 className="text-2xl font-semibold mb-2 text-blue-700">Pro</h3>
                        <p className="text-blue-600 mb-6">Pour les utilisateurs exigeants</p>
                        <ul className="space-y-3 text-blue-800 text-sm">
                            <li>🚀 Messages illimités</li>
                            <li>🚀 5 Go de pièces jointes</li>
                            <li>🚀 Jusqu’à 50 membres / conversation</li>
                            <li>🚀 Rétention illimitée</li>
                            <li>🚀 Support prioritaire</li>
                        </ul>
                        <p className="mt-6 text-2xl font-bold text-blue-700">9,99 €/mois</p>
                        <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                            Commencez votre essai gratuit
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}