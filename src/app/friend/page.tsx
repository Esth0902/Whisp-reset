'use client';

import { useEffect, useState } from 'react';
import FriendInvitationForm from '@/component/friendinvitationform';
import { useAuth } from '@clerk/nextjs';
import { useRealtime } from '@/hooks/useRealtime';
import toast from 'react-hot-toast';

type User = {
    clerkId: string;
    name?: string | null;
    username?: string | null;
};

type FriendshipInvitation = {
    id: string;
    user: User;
    friend: User;
    status: string;
};

export default function FriendsPage() {
    const { getToken, userId } = useAuth();
    const [pendingInvitations, setPendingInvitations] = useState<FriendshipInvitation[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchData() {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();

            const [pendRes, friendsRes] = await Promise.all([
                fetch(`/api/friendships/invitations`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`/api/friendships/friends`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!pendRes.ok || !friendsRes.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const pendData: FriendshipInvitation[] = await pendRes.json();
            const friendsData: User[] = await friendsRes.json();

            setPendingInvitations(pendData);
            setFriends(friendsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function respondInvitation(id: string, status: 'accepted' | 'declined') {
        try {
            const token = await getToken();

            const res = await fetch(`/api/friendships/${id}/respond`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la réponse');
            }

            fetchData();
        } catch (err) {
            toast.error('Erreur: ' + (err as Error).message);
        }
    }

    // 🚀 Branche le temps réel
    useRealtime(userId ?? undefined, {
        onInvitation: (data) => {
            toast(`📩 Nouvelle invitation de ${data.from}`);
            fetchData();
        },
        onResponse: (data) => {
            if (data.status === 'accepted') {
                toast.success(`${data.by} a accepté votre invitation 🎉`);
            } else {
                toast.error(`${data.by} a refusé votre invitation ❌`);
            }
            fetchData();
        },
    });

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Gestion des amis</h1>

            <FriendInvitationForm onSent={fetchData} />

            {loading ? (
                <p>Chargement des invitations et amis...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <>
                    {/* Invitations reçues */}
                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">Invitations reçues</h2>
                        {pendingInvitations.length === 0 && <p>Aucune invitation en attente.</p>}
                        <ul>
                            {pendingInvitations.map((inv) => (
                                <li
                                    key={inv.id}
                                    className="flex justify-between items-center border rounded p-3 mb-2 bg-white"
                                >
                                    <span>{inv.user.name ?? inv.user.username ?? inv.user.clerkId}</span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => respondInvitation(inv.id, 'accepted')}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => respondInvitation(inv.id, 'declined')}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Liste des amis */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Amis</h2>
                        {friends.length === 0 ? (
                            <p>Vous n’avez pas encore d’amis.</p>
                        ) : (
                            <ul>
                                {friends.map((friend) => (
                                    <li
                                        key={friend.clerkId}
                                        className="border rounded p-3 mb-2 bg-white"
                                    >
                                        {friend.name && friend.name.trim() !== ''
                                            ? friend.name
                                            : friend.username ?? friend.clerkId}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
