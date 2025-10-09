import { create } from 'zustand';

export type NotificationItem = {
    id: string;
    type: string;
    message: string;
    createdAt: Date;   // ⚡ toujours une Date côté frontend
    read?: boolean;
};

type State = {
    notifications: NotificationItem[];
    setNotifications: (items: NotificationItem[]) => void;
    addNotification: (item: NotificationItem) => void;
    clearNotifications: () => void;
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
}));

