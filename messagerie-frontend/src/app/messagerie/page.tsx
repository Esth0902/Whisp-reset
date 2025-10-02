"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit2, Check } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

type Message = {
    id: string;
    content: string;
    author: { name: string };
};

type Conversation = {
    id: string;
    title?: string;
    messages: Message[];
};

type Friend = {
    id: string;
    name: string;
};

export default function MessengerPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<string>("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const { getToken } = useAuth();

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
            setConversations(data);
            if (data.length > 0) setActiveId(data[0].id);
        };

        fetchConversations();
    }, []);

    // 🔄 Charger les amis
    useEffect(() => {
        const fetchFriends = async () => {
            const token = await getToken();
            const res = await fetch("http://localhost:4000/friends", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setFriends(data);
        };

        fetchFriends();
    }, []);

    const activeConv = conversations.find((c) => c.id === activeId);

    // 📩 Envoyer un message
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeId) return;

        const token = await getToken();

        await fetch("http://localhost:3001/messages", {
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
        setConversations(updated);
    };

    // ➕ Créer une conversation avec un ami
    const createConversationWithFriend = async () => {
        if (!selectedFriend) return;

        const token = await getToken();

        const res = await fetch("http://localhost:4000/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                content: "Salut 👋",
                recipientId: selectedFriend,
            }),
        });

        const newMessage = await res.json();

        const updatedRes = await fetch("http://localhost:4000/conversations/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const updated = await updatedRes.json();
        setConversations(updated);
        setActiveId(newMessage.conversationId);
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
                        value={selectedFriend}
                        onChange={(e) => setSelectedFriend(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Choisir un ami</option>
                        {friends.map((friend) => (
                            <option key={friend.id} value={friend.id}>
                                {friend.name}
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
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-3 cursor-pointer ${
                                conv.id === activeId ? "bg-indigo-50" : "hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveId(conv.id)}
                        >
                            {conv.title || "Sans titre"}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Zone principale */}
            <main className="flex-1 flex flex-col bg-gray-100">
                {activeConv ? (
                    <>
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