'use client';

import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-3 px-6 text-center mt-auto font-sans text-xs select-none">
            <p>© {new Date().getFullYear()} Whisp - Tous droits réservés</p>
            <p className="mt-0.5">Site de messagerie simple et moderne</p>
        </footer>
    );
}
