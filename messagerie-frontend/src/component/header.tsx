'use client';

import React, { useEffect, useState } from 'react';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import LogoutButton from '@/component/logout';
import NotificationBell from '@/component/notification-bell';
import { useNotificationStore } from '@/store/notification-store';
import { useRealtime } from '@/hooks/useRealtime';

export default function Header() {
    const { isSignedIn } = useUser();
    const { userId, getToken } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    // 🔔 State global (Zustand)
    const notifications = useNotificationStore((s) => s.notifications);
    const setNotifications = useNotificationStore((s) => s.setNotifications);
    const clearNotifications = useNotificationStore((s) => s.clearNotifications);

    // 🔌 Connexion temps réel (listener)
    useRealtime(userId ?? undefined);

    // 🔄 Charger les notifs persistées en DB quand userId change
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const token = await getToken();
                const res = await fetch('http://localhost:4000/notifications', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Impossible de charger les notifications');
                const data = await res.json();
                setNotifications(data); // hydrate le store avec ce qui vient de la DB
            } catch (err) {
                console.error('Erreur chargement notifications:', err);
            }
        })();
    }, [userId, getToken, setNotifications]);

    // lien actif
    const linkClass = (path: string) =>
        `font-medium transition-colors ${
            pathname === path ? 'text-indigo-400 underline' : 'hover:text-gray-400'
        }`;

    return (
        <header className="bg-gray-900 text-gray-100 px-6 py-4 flex items-center justify-between shadow-md relative z-50">
            {/* Logo */}
            <h1 className="text-2xl font-bold font-sans select-none">
                <Link href="/" className="hover:text-gray-400 transition-colors">
                    Whisp
                </Link>
            </h1>

            {/* Desktop navigation */}
            {isSignedIn ? (
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/friend" className={linkClass('/friend')}>
                        Amis
                    </Link>
                    <Link href="/messagerie" className={linkClass('/profile')}>
                        Messagerie
                    </Link>

                    {/* 🔔 Cloche persistante */}
                    <NotificationBell
                        count={notifications.length}
                        notifications={notifications}
                        onClear={clearNotifications}
                    />

                    <UserButton />
                    <LogoutButton />
                </nav>
            ) : (
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/sign-in" className={linkClass('/sign-in')}>
                        Se connecter
                    </Link>
                    <Link href="/sign-up" className={linkClass('/sign-up')}>
                        S’inscrire
                    </Link>
                </nav>
            )}

            {/* Mobile menu button */}
            <button
                className="md:hidden p-2 rounded hover:bg-gray-800 transition"
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                onClick={() => setMenuOpen(!menuOpen)}
                type="button"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-900 shadow-md md:hidden z-50">
                    <nav className="flex flex-col items-center gap-4 py-6">
                        {isSignedIn ? (
                            <>
                                <Link
                                    href="/friend"
                                    className={linkClass('/friend')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Amis
                                </Link>
                                <Link
                                    href="/profile"
                                    className={linkClass('/profile')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Profil
                                </Link>

                                {/* 🔔 Cloche aussi en mobile */}
                                <NotificationBell
                                    count={notifications.length}
                                    notifications={notifications}
                                    onClear={clearNotifications}
                                />

                                <UserButton />
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className={linkClass('/sign-in')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Se connecter
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className={linkClass('/sign-up')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    S’inscrire
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

