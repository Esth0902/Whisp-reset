
jest.mock("socket.io-client", () => {
    return {
        io: () => ({
            on: jest.fn(),
            emit: jest.fn(),
            off: jest.fn(),
            disconnect: jest.fn(),
        }),
    };
});

import {render, screen} from '@testing-library/react';
import MessengerPage from '../src/app/messagerie/page';

jest.mock('@clerk/nextjs', () => ({
    useUser: () => ({ user: { id: '123', firstName: 'John'},
    }),
    useAuth:() => ({getToken: async () => 'fake-token',
    userId: "user-123",}),
}));


global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () =>
            Promise.resolve([
                {
                    id: "conv-1",
                    title: "Test",
                    messages: [
                        {
                            id: "msg-1",
                            content: "Bonjour !",
                            createdAt: "2025-10-17T10:00:00Z",
                            author: { name: "John", clerkId: "user-123" },
                            conversationId: "conv-1",
                        },
                    ],
                    users: [
                        {
                            user: { clerkId: "user-123", name: "John" },
                            role: "admin",
                        },
                    ],
                },
            ]),
    })
) as jest.Mock;

test("affiche message et auteur", async () => {
    render(<MessengerPage/>)

    const MessageText = await screen.findByText("Bonjour !");
    const authorName = await screen.findByText("John");

    expect(MessageText).toBeInTheDocument();
    expect(authorName).toBeInTheDocument();
});