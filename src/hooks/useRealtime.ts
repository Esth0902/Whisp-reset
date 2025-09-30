'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/store/notification-store';

let socket: Socket | null = null;

export function useRealtime(clerkId?: string) {
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        if (!clerkId) return;

        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
                auth: { clerkId },
            });

            socket.on('connect', () => console.log('✅ Connecté au serveur temps réel'));
            socket.on('disconnect', () => console.log('❌ Déconnecté du serveur temps réel'));

            // Invitation reçue
            socket.on('friendship.requested', (data) => {
                console.log('📩 Invitation reçue', data);
                addNotification({
                    id: data.id,
                    message: `📩 Nouvelle invitation de ${data.from}`,
                    type: 'invitation',
                });
            });

            // Réponse à une invitation
            socket.on('friendship.responded', (data) => {
                console.log('🎉 Réponse reçue', data);
                addNotification({
                    id: data.id,
                    message:
                        data.status === 'accepted'
                            ? `🎉 ${data.by} a accepté ton invitation`
                            : `❌ ${data.by} a refusé ton invitation`,
                    type: 'response',
                });
            });
        }

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [clerkId, addNotification]);
}
