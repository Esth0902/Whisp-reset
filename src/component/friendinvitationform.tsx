'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type Props = {
    onSent?: () => void;
};

const baseUrl = 'http://localhost:4000';

export default function FriendInvitationForm({ onSent }: Props) {
    const { getToken } = useAuth();

    const [friendId, setFriendId] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            const token = await getToken();

            const res = await fetch(`${baseUrl}/friendships`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ friendId }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erreur inconnue');
            }
            setStatus('Invitation envoyée !');
            setFriendId('');
            onSent?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-6 max-w-sm mx-auto p-4 border rounded shadow bg-white">
            <label htmlFor="friendId" className="block mb-2 font-semibold">
                Identifiant utilisateur (clerkId) de l’ami :
            </label>
            <input
                id="friendId"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4"
                placeholder="Exemple : user_abc123"
                required
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
                {loading ? 'Envoi en cours...' : 'Envoyer une invitation'}
            </button>
            {status && <p className="mt-3 text-green-600">{status}</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}
        </form>
    );
}
