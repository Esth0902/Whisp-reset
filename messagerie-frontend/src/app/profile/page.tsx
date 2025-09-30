'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type UserProfile = {
    name: string;
    email: string;
};

export default function ProfilePage() {
    const { getToken } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const token = await getToken();
                const res = await fetch('http://localhost:4000/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Erreur lors de la récupération du profil');
                const data: UserProfile = await res.json();
                setUser(data);
            } catch (err: any) {
                setError(err.message);
            }
        }
        fetchProfile();
    }, [getToken]);

    if (error) return <div>Erreur : {error}</div>;
    if (!user) return <div>Chargement...</div>;

    return (
        <main>
            <h1>Bienvenue {user.name}</h1>
            <p>Email : {user.email}</p>
        </main>
    );
}
