"use client";

import { useState } from "react";
import { Plus, Trash, Edit2, Check } from "lucide-react";

type Conversation = {
    id: string;
    name: string;
    messages: { id: string; text: string; sender: string }[];
};

export default function MessengerPage() {
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: "1",
            name: "Discussion 1",
            messages: [
                { id: "m1", text: "Salut 👋", sender: "Alice" },
                { id: "m2", text: "Coucou 😄", sender: "Moi" },
            ],
        },
    ]);

    const [activeId, setActiveId] = useState("1");
    const [newMessage, setNewMessage] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const activeConv = conversations.find((c) => c.id === activeId);

    // ➕ Créer une nouvelle conversation
    const createConversation = () => {
        const id = Date.now().toString();
        setConversations((prev) => [
            ...prev,
            { id, name: `Nouvelle conv ${prev.length + 1}`, messages: [] },
        ]);
        setActiveId(id);
    };

    // 🗑️ Supprimer une conversation
    const deleteConversation = (id: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeId === id && conversations.length > 1) {
            setActiveId(conversations[0].id);
        }
    };

    // ✏️ Renommer une conversation
    const renameConversation = (id: string) => {
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, name: editValue } : c))
        );
        setEditingId(null);
        setEditValue("");
    };

    // 📩 Envoyer un message
    const sendMessage = () => {
        if (!newMessage.trim() || !activeConv) return;
        setConversations((prev) =>
            prev.map((c) =>
                c.id === activeId
                    ? {
                        ...c,
                        messages: [
                            ...c.messages,
                            { id: Date.now().toString(), text: newMessage, sender: "Moi" },
                        ],
                    }
                    : c
            )
        );
        setNewMessage("");
    };

    return (
        <div className="h-[calc(100vh-64px)] flex bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <aside className="w-1/4 border-r border-gray-200 flex flex-col bg-white">
                <div className="p-4 flex justify-between items-center border-b border-gray-200">
                    <h2 className="font-bold">Conversations</h2>
                    <button onClick={createConversation} className="hover:text-indigo-600">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-3 flex justify-between items-center cursor-pointer ${
                                conv.id === activeId ? "bg-indigo-50" : "hover:bg-gray-100"
                            }`}
                            onClick={() => setActiveId(conv.id)}
                        >
                            {editingId === conv.id ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 rounded border border-gray-300 p-1 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            renameConversation(conv.id);
                                        }}
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span>{conv.name}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(conv.id);
                                                setEditValue(conv.name);
                                            }}
                                            className="hover:text-indigo-600"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteConversation(conv.id);
                                            }}
                                            className="hover:text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
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
                                        msg.sender === "Moi"
                                            ? "ml-auto bg-green-500 text-white"
                                            : "bg-white border border-gray-200 text-gray-900"
                                    }`}
                                >
                                    {msg.text}
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
