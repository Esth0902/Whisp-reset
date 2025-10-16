import {PropsWithChildren} from "react";

export const useUser = jest.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
        id: "user_123",
        fullName: "John Doe",
        primaryEmailAddress: {
            emailAddress: "john@example.com",
        },
    },
}));

export const useAuth = jest.fn(() => ({
    isLoaded: true,
    userId: "user_123",
    getToken: jest.fn(() => Promise.resolve("fake-token")),
}));


export const ClerkProvider = ({ children }: PropsWithChildren) => children;
