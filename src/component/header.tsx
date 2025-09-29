'use client';

import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import LogoutButton from '@/component/logout';

export default function Header() {
    const { isSignedIn } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    // fonction utilitaire pour appliquer un style actif
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
                    <Link href="/profile" className={linkClass('/profile')}>
                        Profil
                    </Link>
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
                                    href="/utilisateur"
                                    className={linkClass('/utilisateur')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Utilisateur
                                </Link>
                                <Link
                                    href="/messagerie"
                                    className={linkClass('/messagerie')}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Messagerie
                                </Link>
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
