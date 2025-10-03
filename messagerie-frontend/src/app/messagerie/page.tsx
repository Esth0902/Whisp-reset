"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type Message = {
    id: string;
    content: string;
    author: { name: string };
};

type ConversationUser = {
    user: { clerkId: string; name: string };
    role: "admin" | "member";
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
    const [newMessage, setNewMessage] = useState("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const { getToken,userId: currentUserId } = useAuth();

    // 🔄 Charger les conversations
    useEffect(() => {
        const fetchConversations = async () => {
            const token = await getToken();
            const res = await fetch("http://localhost:4000/conversations/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setConversations(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) setActiveId(data[0].id);
        };
        fetchConversations();
    }, []);

    // 🔄 Charger les amis
    useEffect(() => {
        const fetchFriends = async () => {
            const token = await getToken();
            const res = await fetch("/api/friendships/friends", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();

            setFriends(Array.isArray(data) ? data : []);
        };
        fetchFriends();
    }, []);

    const activeConv = conversations.find((c) => c.id === activeId);

    const isAdmin = activeConv?.users.some(
        (cu) => cu.role === "admin" && cu.user.clerkId === currentUserId
    );

    // Envoyer un message
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeId) return;

        const token = await getToken();

        await fetch("http://localhost:4000/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                content: newMessage,
                conversationId: activeId,
            }),
        });

        setNewMessage("");

        // Recharge les conversations
        const res = await fetch("http://localhost:4000/conversations/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const updated = await res.json();
        setConversations(Array.isArray(updated) ? updated : []);
    };

    // Créer une conversation avec un ami
    const createConversationWithFriend = async () => {
        if (!selectedFriends) return;

        const token = await getToken();

        const res = await fetch("http://localhost:4000/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
                body: JSON.stringify({ recipientIds: selectedFriends }),
            })

        const updatedRes = await fetch("http://localhost:4000/conversations/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const updated = await updatedRes.json();
        setConversations(Array.isArray(updated) ? updated : []);
        setActiveId(updated[0]?.id ?? null);
        setSelectedFriends([]);
    };

    // Supprimer une conversation (admin seulement)
    const deleteConversation = async (conversationId: string) => {
        const token = await getToken();
        await fetch(`http://localhost:4000/conversations/${conversationId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (activeId === conversationId) setActiveId(null);
    };

    // Renommer une conversation (admin seulement)
    const renameConversation = async (conversationId: string) => {
        const newTitle = prompt("Entrez le nouveau nom de la conversation");
        if (!newTitle) return;

        const token = await getToken();
        await fetch(`http://localhost:4000/conversations/${conversationId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTitle }),
        });

        // Mettre à jour localement
        setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
        );
    };

    return (
        <div className="h-[calc(100vh-64px)] flex bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <aside className="w-1/4 border-r border-gray-200 flex flex-col bg-white">
                <div className="p-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="font-bold">Conversations</h2>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <select
                        multiple
                        value={selectedFriends}
                        onChange={(e) =>
                            setSelectedFriends(Array.from(e.target.selectedOptions, (o) => o.value))
                        }
                        className="w-full border rounded p-2"
                    >
                        {friends.map((friend) => (
                            <option key={friend.clerkId} value={friend.clerkId}>
                                {friend.name ?? friend.clerkId}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={createConversationWithFriend}
                        className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
                    >
                        ➕ Nouvelle conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {Array.isArray(conversations) &&
                        conversations.map((conv) => {
                            const isAdminForConv = conv.users.some(
                                (cu) => cu.role === "admin" && cu.user.clerkId === currentUserId
                            );

                            return (
                                <div
                                    key={conv.id}
                                    className={`flex items-center justify-between p-3 cursor-pointer ${
                                        conv.id === activeId ? "bg-indigo-50" : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => setActiveId(conv.id)}
                                >
                                    <span className="truncate">{conv.title || "Sans titre"}</span>

                                    {isAdminForConv && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    renameConversation(conv.id);
                                                }}
                                                className="hover:text-indigo-600"
                                                title="Renommer"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteConversation(conv.id);
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
                        {/* HEADER de la conversation */}
                        <div className="flex items-center gap-2 p-2 border-b bg-white">
                            <h2 className="font-bold flex-1 text-lg truncate">{activeConv.title || "Nouvelle discussion"}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {activeConv.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-2 rounded-lg max-w-xs shadow ${
                                        msg.author.name === "Moi"
                                            ? "ml-auto bg-green-500 text-white"
                                            : "bg-white border border-gray-200 text-gray-900"
                                    }`}
                                >
                                    {msg.content}
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
        </div>
    );
}