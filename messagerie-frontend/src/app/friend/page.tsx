'use client';

import { useEffect, useState, useCallback } from 'react';
import FriendInvitationForm from '@/component/friendinvitationform';
import { useAuth, useUser } from '@clerk/nextjs';
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
    const {getToken} = useAuth();
    const [pendingInvitations, setPendingInvitations] = useState<FriendshipInvitation[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();

            const [pendRes, friendsRes] = await Promise.all([
                fetch(`/api/friendships/invitations`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
                fetch(`/api/friendships/friends`, {
                    headers: {Authorization: `Bearer ${token}`},
                }),
            ]);

            if (!pendRes.ok || !friendsRes.ok) {
                throw new Error('Erreur lors du chargement');
            }

            const pendData: FriendshipInvitation[] = await pendRes.json();
            const friendsData: User[] = await friendsRes.json();

            setPendingInvitations(pendData);
            setFriends(friendsData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function respondInvitation(id: string, status: 'accepted' | 'declined') {
        try {
            const token = await getToken();
            const res = await fetch(`/api/friendships/${id}/respond`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({status}),
            });

            if (!res.ok) throw new Error('Erreur lors de la réponse');

            fetchData();
        } catch (err) {
            alert('Erreur: ' + (err as Error).message);
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="w-full max-w-6xl mx-auto px-8 py-10 space-y-10 flex-1">
                <h1 className="text-3xl font-bold text-gray-800">👥 Gestion des amis</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Inviter un ami</h2>
                    <FriendInvitationForm onSent={fetchData}/>
                </section>

                {loading ? (
                    <p className="text-gray-500">Chargement des invitations et amis...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        {/* Invitations reçues */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">📩 Invitations reçues</h2>
                            {pendingInvitations.length === 0 ? (
                                <p className="text-gray-500">Aucune invitation en attente.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {pendingInvitations.map((inv) => (
                                        <li
                                            key={inv.id}
                                            className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                        >
                    <span className="text-gray-800 font-medium">
                      {inv.user.name ?? inv.user.username ?? inv.user.clerkId}
                    </span>
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
                            )}
                        </section>

                        {/* Vos amis */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">👫 Vos amis</h2>
                            {friends.length === 0 ? (
                                <p className="text-gray-500">Vous n’avez pas encore d’amis.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {friends.map((friend) => (
                                        <li
                                            key={friend.clerkId}
                                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex justify-between items-center"
                                        >
                    <span className="text-gray-800 font-medium">
                      {friend.name?.trim() !== ''
                          ? friend.name
                          : friend.username ?? friend.clerkId}
                    </span>
                                            <button
                                                onClick={async () => {
                                                    const confirmed = window.confirm(
                                                        `Voulez-vous vraiment supprimer l'amitié avec ${friend.name ?? friend.username ?? friend.clerkId} ?`
                                                    );
                                                    if (!confirmed) return;
                                                    try {
                                                        const token = await getToken();
                                                        const res = await fetch(`/api/friendships/${friend.clerkId}`, {
                                                            method: 'DELETE',
                                                            headers: {Authorization: `Bearer ${token}`},
                                                        });
                                                        if (!res.ok) throw new Error('Erreur lors de la suppression');
                                                        toast.success(
                                                            `Amitié avec ${friend.name ?? friend.username ?? friend.clerkId} supprimée`
                                                        );
                                                        fetchData();
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error('Erreur lors de la suppression');
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Supprimer
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
