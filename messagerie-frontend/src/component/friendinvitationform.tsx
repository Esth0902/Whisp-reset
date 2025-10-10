'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

type Props = {
    onSent?: () => void;
};

type UserSuggestion = {
    clerkId: string;
    name: string | null;
};

const baseUrl = 'http://localhost:4000';

export default function FriendInvitationForm({ onSent }: Props) {
    const { getToken } = useAuth();

    const [friendName, setFriendName] = useState('');
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔎 Auto-complétion
    useEffect(() => {
        if (friendName.length < 2) {
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const token = await getToken();
                const res = await fetch(
                    `${baseUrl}/users/search?query=${encodeURIComponent(friendName)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) return;
                const data: UserSuggestion[] = await res.json();
                setSuggestions(data);
            } catch {
                setSuggestions([]);
            }
        }, 300); // debounce 300ms

        return () => clearTimeout(timeout);
    }, [friendName, getToken]);

    // 📩 Envoi invitation
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
                body: JSON.stringify({ friendName }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erreur inconnue');
            }

            setStatus('Invitation envoyée !');
            setFriendName('');
            setSuggestions([]);
            onSent?.();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-md"
        >

        <label htmlFor="friendName" className="block mb-2 font-semibold">
                Nom de l’ami :
            </label>
            <input
                id="friendName"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Nom ou pseudo de l’ami"
                required
                disabled={loading}
            />

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
                <ul className="absolute bg-white border rounded shadow w-full mt-1 z-10 max-h-48 overflow-auto">
                    {suggestions.map((s) => (
                        <li
                            key={s.clerkId}
                            onClick={() => {
                                setFriendName(s.name || '');
                                setSuggestions([]);
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {s.name ?? s.clerkId}
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
                {loading ? 'Envoi en cours...' : '➕ Envoyer l’invitation'}
            </button>


    {status && <p className="mt-3 text-green-600">{status}</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}
        </form>
    );
}
