'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationItem, useNotificationStore } from '@/store/notification-store';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function NotificationBell({
                                             count,
                                             notifications,
                                             onClear,
                                         }: {
    count: number;
    notifications: NotificationItem[];
    onClear: () => void;
}) {
    const [open, setOpen] = useState(false);
    const { getToken } = useAuth();

    const loadFromServer = useNotificationStore((s) => s.loadFromServer);
    const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (token) {
                await loadFromServer(token);
            }
        })();
    }, [getToken, loadFromServer]);

    async function handleMarkAllRead() {
        const token = await getToken();
        if (token) {
            await markAllAsRead(token);
        }
        onClear();
    }

    return (
        <div className="relative">
            <button
                className="relative p-2 rounded hover:bg-gray-800 transition"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Notifications"
                type="button"
            >
                <Bell />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {count}
          </span>
                )}
            </button>

            {open && (
                <div className="absolute mt-2 bg-white shadow-lg rounded p-3 z-50 text-gray-900
                               right-0 sm:w-72 w-[90vw] max-w-sm sm:right-0 sm:left-auto left-1/2 sm:translate-x-0 -translate-x-1/2"
                >
                    <h3 className="font-bold mb-2">Notifications</h3>

                    {notifications.length === 0 ? (
                        <p className="text-gray-500">Aucune notification</p>
                    ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {notifications.map((n) => (
                                <li key={n.id} className="text-sm border-b pb-1">
                                    <div className="flex items-center justify-between">
                                        {n.link ? (
                                            <Link
                                                href={n.link}
                                                className="text-blue-600 hover:underline"
                                                onClick={() => setOpen(false)}
                                            >
                                                {n.message}
                                            </Link>
                                        ) : (
                                            <span>{n.message}</span>
                                        )}

                                        <span className="ml-2 text-[10px] text-gray-400">
                      {n.createdAt instanceof Date
                          ? n.createdAt.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                          : new Date(n.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })}
                    </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                            type="button"
                        >
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
