// src/store/notification-store.ts
import { create } from 'zustand';

export type NotificationItem = {
    id: string;
    message: string;
    type: 'invitation' | 'response' | 'message'; // message sera utile pour la suite (chat)
    createdAt: Date;
};

type NotificationState = {
    notifications: NotificationItem[];
    addNotification: (notif: Omit<NotificationItem, 'createdAt'>) => void;
    clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notif) =>
        set((state) => ({
            notifications: [
                { ...notif, createdAt: new Date() },
                ...state.notifications,
            ],
        })),
    clearNotifications: () => set({ notifications: [] }),
}));
