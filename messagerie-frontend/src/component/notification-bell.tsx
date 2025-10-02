'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { NotificationItem } from '@/store/notification-store';

type Props = {
    count: number;
    notifications: NotificationItem[];
    onClear: () => void;
};

export default function NotificationBell({ count, notifications, onClear }: Props) {
    const [open, setOpen] = useState(false);

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
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded p-3 z-50 text-gray-900">
                    <h3 className="font-bold mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="text-gray-500">Aucune notification</p>
                    ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {notifications.map((n) => (
                                <li key={n.id} className="text-sm border-b pb-1">
                                    <div className="flex items-center justify-between">
                                        <span>{n.message}</span>
                                        <span className="ml-2 text-[10px] text-gray-400">
                      {n.createdAt.toLocaleTimeString('fr-FR', {
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
                            onClick={onClear}
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
