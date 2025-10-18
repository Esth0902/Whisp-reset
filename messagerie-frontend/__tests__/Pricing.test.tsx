import { render, screen } from '@testing-library/react';
import HomePage from '../src/app/page';


jest.mock("@clerk/nextjs", () => ({
    useUser: () => ({ isSignedIn: false, user: null }),
    useAuth: () => ({ getToken: jest.fn() }),
    SignedIn: ({ children }: { children: React.ReactNode }) => null,
    SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

test("affichage du pricing si utilisateur pas connecté", () => {
    render(<HomePage/>);

    expect(screen.getByText(/Nos offres/i)).toBeInTheDocument();
    expect(screen.getByText(/Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro/i)).toBeInTheDocument();

});
