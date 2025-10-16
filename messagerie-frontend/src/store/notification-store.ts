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

type State = {
    notifications: NotificationItem[];

    // Actions locales
    setNotifications: (items: NotificationItem[]) => void;
    addNotification: (item: NotificationItem) => void;
    clearNotifications: () => void;

    // 🔥 Nouvelles actions serveur
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

    // 🔹 Charger les notifications non lues depuis le backend
    loadFromServer: async (token: string) => {
        try {
            const res = await fetch('http://localhost:4000/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Erreur de chargement des notifications');

            const data = await res.json();
            set({
                notifications: data.map((n: any) => ({
                    id: n.id,
                    type: n.type,
                    message: n.message,
                    createdAt: new Date(n.createdAt),
                    read: n.read,
                })),
            });
        } catch (err) {
            console.error('❌ Erreur loadFromServer:', err);
        }
    },

    // 🔹 Marquer toutes les notifications comme lues
    markAllAsRead: async (token: string) => {
        try {
            const res = await fetch('http://localhost:4000/notifications/mark-read', {
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
