'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

type InvitationPayload = {
    id: string;
    from: string;
};

type ResponsePayload = {
    id: string;
    status: 'accepted' | 'declined';
    by: string;
};

type RealtimeCallbacks = {
    onInvitation?: (data: InvitationPayload) => void;
    onResponse?: (data: ResponsePayload) => void;
};

export function useRealtime(clerkId?: string, callbacks?: RealtimeCallbacks) {
    useEffect(() => {
        if (!clerkId) return;

        if (!socket) {
            socket = io('http://localhost:4000', {
                auth: { clerkId },
            });

            socket.on('connect', () => {
                console.log('✅ Connecté au serveur temps réel');
            });

            socket.on('disconnect', () => {
                console.log('❌ Déconnecté du serveur temps réel');
            });

            // 🔔 Invitation reçue
            socket.on('friendship.requested', (data: InvitationPayload) => {
                console.log('📩 Invitation reçue', data);
                if (callbacks?.onInvitation) callbacks.onInvitation(data);
                else toast(`📩 Nouvelle invitation de ${data.from}`);
            });

            // 🎉 Réponse à ma demande
            socket.on('friendship.responded', (data: ResponsePayload) => {
                console.log('🎉 Réponse reçue', data);
                if (callbacks?.onResponse) callbacks.onResponse(data);
                else {
                    if (data.status === 'accepted') {
                        toast.success(`${data.by} a accepté votre invitation 🎉`);
                    } else {
                        toast.error(`${data.by} a refusé votre invitation ❌`);
                    }
                }
            });
        }

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [clerkId, callbacks]);
}
