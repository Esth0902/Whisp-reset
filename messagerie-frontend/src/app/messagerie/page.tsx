'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

type Message = {
    id: string;
    content: string;
    author: { name: string; clerkId: string };
};

type ConversationUser = {
    user: { clerkId: string; name: string };
    role: 'admin' | 'member';
};

type Conversation = {
    id: string;
    title?: string;
    messages: Message[];
    users: ConversationUser[];
};

type Friend = {
    clerkId: string;
    name: string;
};

export default function MessengerPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const { getToken, userId: currentUserId } = useAuth();
    const { user } = useUser();
    const clerkUserId = user?.id;
    const userName = user?.firstName || user?.fullName || 'Utilisateur inconnu';
    const [searchConv, setSearchConv] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchConversations = async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setConversations(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) setActiveId(data[0].id);
        };
        void fetchConversations();
    }, []);

    useEffect(() => {
        if (!activeId) return;
        socket.emit('joinConversation', activeId);
        socket.on('newMessage', (message) => {
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === message.conversationId
                        ? { ...c, messages: [...c.messages, message] }
                        : c
                )
            );
        });
        return () => {
            socket.off('newMessage');
        };
    }, [activeId]);

    useEffect(() => {
        const fetchFriends = async () => {
            const token = await getToken();
            const res = await fetch('/api/friendships/friends', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setFriends(Array.isArray(data) ? data : []);
        };
        void fetchFriends();
    }, []);

    const activeConv = conversations.find((c) => c.id === activeId);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeId || !clerkUserId) return;
        socket.emit('sendMessage', {
            conversationId: activeId,
            content: newMessage,
            clerkUserId,
            authorName: userName,
        });
        setNewMessage('');
    };

    const createConversationWithFriend = async () => {
        if (!selectedFriends || selectedFriends.length === 0) return;
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientIds: selectedFriends }),
        });
        if (!res.ok) {
            const error = await res.json();
            alert(error.message || 'Impossible de créer la conversation');
            return;
        }
        const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const updated = await updatedRes.json();
        setConversations(Array.isArray(updated) ? updated : []);
        setActiveId(updated[0]?.id ?? null);
        setSelectedFriends([]); // ✅ décocher automatiquement
    };

    const deleteConversation = async (conversationId: string) => {
        const token = await getToken();
        await fetch(`http://localhost:4000/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (activeId === conversationId) setActiveId(null);
    };

    const renameConversation = async (conversationId: string) => {
        const newTitle = prompt('Entrez le nouveau nom de la conversation');
        if (!newTitle) return;
        const token = await getToken();
        await fetch(`http://localhost:4000/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTitle }),
        });
        setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
        );
    };

    const filterConversations = conversations.filter((conv) =>
        (conv.title || '').toLowerCase().includes(searchConv.toLowerCase()) ||
        conv.users.some((u) =>
            u.user.name.toLowerCase().includes(searchConv.toLowerCase())
        )
    );

    return (
        <div className="h-[calc(100vh-64px)] flex bg-gray-50 text-gray-900">
            {/* Sidebar */}

            <aside className="w-1/4 border-r border-gray-200 flex flex-col bg-white">

                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Mes conversations</h2>
                </div>

                <input
                    type="text"
                    placeholder="Rechercher une conversation..."
                    value={searchConv}
                    onChange={(e) => setSearchConv(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                />

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={()=> setShowModal(true)}
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        ✨ Nouvelle conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filterConversations.length === 0 && (
                        <p className="text-sm text-gray-500 px-4">Aucune conversation trouvée.</p>
                    )}
                    {filterConversations.map((conv) => {
                        const isAdminForConv = conv.users.some(
                            (cu) => cu.role === 'admin' && cu.user.clerkId === currentUserId
                        );
                        return (
                            <div
                                key={conv.id}
                                className={`flex items-center justify-between p-3 cursor-pointer ${
                                    conv.id === activeId ? 'bg-indigo-50' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveId(conv.id)}
                            >
                <span className="truncate text-sm font-medium text-gray-800">
                  {conv.title || 'Sans titre'}
                </span>
                                {isAdminForConv && (
                                    <div className="flex gap-2 text-gray-400 text-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void renameConversation(conv.id);
                                            }}
                                            className="hover:text-indigo-600"
                                            title="Renommer"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void deleteConversation(conv.id);
                                            }}
                                            className="hover:text-red-500"
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Zone principale */}
            <main className="flex-1 flex flex-col bg-gray-100">
                {activeConv ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                            {activeConv.messages.map((msg, index) => (
                                <div
                                    key={msg.id ?? `msg-${index}`}
                                    className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm ${
                                        msg.author?.clerkId === currentUserId
                                            ? 'ml-auto bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <div className="text-xs font-semibold mb-1 opacity-80">
                                        {msg.author?.name || 'Utilisateur inconnu'}
                                    </div>
                                    <div>{msg.content}</div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-200 flex gap-2 bg-white">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border rounded-lg p-2 border-gray-300 focus:outline-none focus:ring focus:ring-indigo-300"
                                placeholder="Écrire un message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded-lg"
                            >
                                Envoyer
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Sélectionne une conversation
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Sélectionnez des amis</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {friends.map((friend) => (
                                <label key={friend.clerkId} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={friend.clerkId}
                                        checked={selectedFriends.includes(friend.clerkId)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setSelectedFriends((prev) =>
                                                checked
                                                    ? [...prev, friend.clerkId]
                                                    : prev.filter((id) => id !== friend.clerkId)
                                            );
                                        }}
                                        className="accent-indigo-600"
                                    />
                                    <span>{friend.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => {
                                    void createConversationWithFriend();
                                    setShowModal(false);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );}

