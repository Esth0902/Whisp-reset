import { render, screen, waitFor } from '@testing-library/react';
import FriendsPage from '../src/app/friend/page';

jest.mock('@clerk/nextjs', () => ({
    useAuth: () => ({
        getToken: async () => 'fake-token',
    }),
}));

jest.mock('@/component/friendinvitationform', () => () => <div data-testid="mocked-form">Formulaire mocké</div>);

beforeEach(() => {
    global.fetch = jest.fn((url: RequestInfo) => {
        if (typeof url === 'string' && url.includes('/api/friendships/friends')) {
            return Promise.resolve({
                ok: true,
                json: async () => [
                    { clerkId: 'user-1', name: 'Alice' },
                    { clerkId: 'user-2', name: 'Bob' },
                ],
            }) as any;
        }

        if (typeof url === 'string' && url.includes('/api/friendships/invitations')) {
            return Promise.resolve({
                ok: true,
                json: async () => [],
            }) as any;
        }

        return Promise.resolve({
            ok: true,
            json: async () => [],
        }) as any;
    }) as jest.Mock;
});

afterEach(() => {
    jest.clearAllMocks();
});

test("affiche la liste d'amis", async () => {
    render(<FriendsPage />);

    await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });
});
