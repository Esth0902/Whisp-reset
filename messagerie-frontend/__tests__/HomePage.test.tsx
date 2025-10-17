import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HomePage from '../src/app/page';
import { PropsWithChildren } from 'react';

jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({ user: null, isSignedIn: false }),
    useAuth: () => ({ getToken: () => Promise.resolve(null) }),
    SignedIn: ({ children }: PropsWithChildren) => <>{children}</>,
    SignedOut: ({ children }: PropsWithChildren) => <>{children}</>,
    SignInButton: ({ children }: PropsWithChildren) => <button>{children}</button>,
}));

test('affiche le mot "messagerie" sur la page', () => {
    render(<HomePage />);
    expect(screen.getByText(/messagerie/i)).toBeInTheDocument();
});
