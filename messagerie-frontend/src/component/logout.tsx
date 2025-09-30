"use client";

import { SignOutButton } from '@clerk/nextjs';

export default function LogoutButton() {
    return (
        <SignOutButton>
            <button style={{
                padding: '8px 16px',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
            }}>
                Déconnexion
            </button>
        </SignOutButton>
    );
}
