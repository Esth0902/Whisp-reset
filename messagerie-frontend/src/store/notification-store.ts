import { create } from 'zustand';

export type NotificationItem = {
    id: string;
    type: string;
    message: string;
    createdAt: Date;
    read?: boolean;
    link?: string;
    fromClerkId?: string;
};

type NotificationResponse = {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    read?: boolean;
    link?: string;
    fromClerkId?: string;
};

type State = {
    notifications: NotificationItem[];

    // Actions locales
    setNotifications: (items: NotificationItem[]) => void;
    addNotification: (item: NotificationItem) => void;
    clearNotifications: () => void;

    loadFromServer: (token: string) => Promise<void>;
    markAllAsRead: (token: string) => Promise<void>;
};

export const useNotificationStore = create<State>((set) => ({
    notifications: [],

    setNotifications: (items) =>
        set({
            notifications: items.map((n) => ({
                ...n,
                createdAt: new Date(n.createdAt),
            })),
        }),

    addNotification: (item) =>
        set((state) => ({
            notifications: [
                {
                    ...item,
                    createdAt: new Date(item.createdAt ?? Date.now()),
                },
                ...state.notifications,
            ],
        })),

    clearNotifications: () => set({ notifications: [] }),

    loadFromServer: async (token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur de chargement des notifications');

            const data: NotificationResponse[] = await res.json();

            set({
                notifications: data.map((n) => ({
                    ...n,
                    createdAt: new Date(n.createdAt),
                })),
            });
        } catch (err) {
            console.error('❌ Erreur loadFromServer:', err);
        }
    },

    markAllAsRead: async (token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur de mise à jour des notifications');
            set({ notifications: [] });
        } catch (err) {
            console.error('Erreur markAllAsRead:', err);
        }
    },
}));
