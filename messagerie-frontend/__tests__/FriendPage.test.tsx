import { render, screen, waitFor } from '@testing-library/react';
import FriendsPage from '../src/app/friend/page';

jest.mock('@clerk/nextjs', () => ({
    useAuth: () => ({
        getToken: async () => 'fake-token',
    }),
}));

jest.mock('@/component/friendinvitationform', () => {
    const MockedForm = () => <div data-testid="mocked-form">Formulaire mocké</div>;
    MockedForm.displayName = 'MockedFriendInvitationForm';
    return MockedForm;
});
beforeEach(() => {
    global.fetch = jest.fn((url: RequestInfo): Promise<Partial<Response>> => {
        if (typeof url === 'string' && url.includes('/api/friendships/friends')) {
            return Promise.resolve({
                ok: true,
                json: async () => [
                    { clerkId: 'user-1', name: 'Alice' },
                    { clerkId: 'user-2', name: 'Bob' },
                ],
            });
        }

        if (typeof url === 'string' && url.includes('/api/friendships/invitations')) {
            return Promise.resolve({
                ok: true,
                json: async () => [],
            });
        }

        return Promise.resolve({
            ok: true,
            json: async () => [],
        });
    }) as unknown as jest.Mock;
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
