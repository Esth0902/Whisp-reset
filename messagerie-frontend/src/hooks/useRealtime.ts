'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notification-store';

let socket: Socket | null = null;

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000';

export function useRealtime(clerkId?: string) {
    const addNotification = useNotificationStore((s) => s.addNotification);

    useEffect(() => {
        if (!clerkId) return;

        if (!socket) {
            socket = io(SOCKET_URL, { auth: { clerkId } });

            socket.on('connect', () => {
                console.log('🔌 Socket connecté:', socket?.id);
            });
            socket.on('disconnect', () => {
                console.log('❌ Socket déconnecté');
            });

            // 📩 Invitation reçue
            socket.on('friendship.requested', (data: { id: string; from: string }) => {
                console.log('📩 friendship.requested', data);
                addNotification({
                    id: `req-${data.id}`,
                    type: 'friendship.requested',
                    message: `📩 Nouvelle invitation de ${data.from}`,
                    createdAt: new Date(),
                });
            });

            // ✅ Acceptée (nouvel event côté back)
            socket.on('friendship.accepted', (data: { by: string; status: 'accepted' }) => {
                console.log('🎉 friendship.accepted', data);
                addNotification({
                    id: `acc-${Date.now()}`,
                    type: 'friendship.accepted',
                    message: `🎉 ${data.by} a accepté ton invitation`,
                    createdAt: new Date(),
                });
            });

            // ❌ Refusée (nouvel event côté back)
            socket.on('friendship.declined', (data: { by: string; status: 'declined' }) => {
                console.log('❌ friendship.declined', data);
                addNotification({
                    id: `dec-${Date.now()}`,
                    type: 'friendship.declined',
                    message: `❌ ${data.by} a refusé ton invitation`,
                    createdAt: new Date(),
                });
            });

            // 🔁 Compatibilité avec l'ancien event unique
            socket.on(
                'friendship.responded',
                (data: { by: string; status: 'accepted' | 'declined' }) => {
                    console.log('↔️ friendship.responded', data);
                    addNotification({
                        id: `resp-${Date.now()}`,
                        type: 'friendship.' + data.status,
                        message:
                            data.status === 'accepted'
                                ? `🎉 ${data.by} a accepté ton invitation`
                                : `❌ ${data.by} a refusé ton invitation`,
                        createdAt: new Date(),
                    });
                },
            );
        }

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [clerkId, addNotification]);
}
