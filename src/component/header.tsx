'use client';

import React, { useState } from 'react';
import {UserButton, useUser} from '@clerk/nextjs';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LogoutButton from "@/component/logout";

export default function Header() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-gray-100 px-6 py-4 flex items-center justify-between shadow-md relative z-50">
      {/* Logo */}
        <UserButton />
      <h1 className="text-2xl font-bold font-sans select-none">
        <Link href="/" className="hover:text-gray-400 transition-colors">
          Whisp
        </Link>
      </h1>

      {/* Desktop navigation */}
      {isSignedIn && (

        <nav className="hidden md:flex items-center gap-8">

          <Link href="/profile" className="font-medium hover:text-gray-400 transition-colors">
            Profil
          </Link>
          <LogoutButton />
        </nav>
      )}

      {/* Mobile menu button */}
      {isSignedIn && (
        <button
          className="md:hidden p-2 rounded hover:bg-gray-800 transition"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile menu */}
      {menuOpen && isSignedIn && (
        <div className="absolute top-full left-0 w-full bg-gray-900 shadow-md md:hidden z-50">
          <nav className="flex flex-col items-center gap-4 py-6">
            {['/utilisateur', '/messagerie', '/profile'].map((path) => (
              <Link
                href={path}
                key={path}
                className="font-medium hover:text-gray-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            ))}
              <UserButton />
            <LogoutButton />
          </nav>
        </div>
      )}
    </header>
  );
}
