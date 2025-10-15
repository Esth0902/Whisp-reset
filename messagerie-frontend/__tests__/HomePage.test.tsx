/// <reference types="jest" />
import React from 'react';
import '@testing-library/jest-dom'; // apporte toBeInTheDocument()
import { render, screen } from '@testing-library/react';
import HomePage from '../src/app/page'; // adapte le chemin si besoin

jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({ user: null, isSignedIn: false }),
    useAuth: () => ({ getToken: () => Promise.resolve(null) }),
    SignedIn: ({ children }: any) => <>{children}</>,
    SignedOut: ({ children }: any) => <>{children}</>,
    SignInButton: ({ children }: any) => <button>{children}</button>,
}));

test('affiche le mot "messagerie" sur la page', () => {
    render(<HomePage />);
    expect(screen.getByText(/messagerie/i)).toBeInTheDocument();
});
