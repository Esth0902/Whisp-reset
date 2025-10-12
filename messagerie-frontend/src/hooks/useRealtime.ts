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
                console.log('Socket déconnecté');
            });

            socket.on('friendship.requested', (data: { id: string; from: string; fromClerkId?: string }) => {
                console.log('📩 friendship.requested', data);
                addNotification({
                    id: `req-${data.id}`,
                    type: 'friendship.requested',
                    message: `📩 Nouvelle invitation de ${data.from}`,
                    link: '/friend', // 🔗 lien vers la page Amis
                    createdAt: new Date(),
                });
            });

            socket.on('friendship.accepted', (data: { by: string; status: 'accepted'; fromClerkId?: string }) => {
                console.log('🎉 friendship.accepted', data);
                addNotification({
                    id: `acc-${Date.now()}`,
                    type: 'friendship.accepted',
                    message: `🎉 ${data.by} a accepté ton invitation`,
                    link: '/friend', // 🔗 idem, renvoie vers la gestion des amis
                    createdAt: new Date(),
                });
            });

            socket.on('friendship.declined', (data: { by: string; status: 'declined'; fromClerkId?: string }) => {
                console.log('❌ friendship.declined', data);
                addNotification({
                    id: `dec-${Date.now()}`,
                    type: 'friendship.declined',
                    message: `❌ ${data.by} a refusé ton invitation`,
                    link: '/friend',
                    createdAt: new Date(),
                });
            });

            socket.on(
                'friendship.responded',
                (data: { by: string; status: 'accepted' | 'declined'; fromClerkId?: string }) => {
                    console.log('↔️ friendship.responded', data);
                    addNotification({
                        id: `resp-${Date.now()}`,
                        type: 'friendship.' + data.status,
                        message:
                            data.status === 'accepted'
                                ? `🎉 ${data.by} a accepté ton invitation`
                                : `❌ ${data.by} a refusé ton invitation`,
                        link: '/friend',
                        createdAt: new Date(),
                    });
                },
            );

            socket.on('message.new', (data: {
                from: string;
                fromClerkId: string;
                conversationId: string;
                content: string;
            }) => {
                console.log('💬 message.new', data);
                addNotification({
                    id: `msg-${data.conversationId}-${Date.now()}`,
                    type: 'message.new',
                    message: `💬 Nouveau message de ${data.from}`,
                    link: `/messagerie?conversation=${data.conversationId}`,
                    createdAt: new Date(),
                });
            });
        }

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [clerkId, addNotification]);
}
