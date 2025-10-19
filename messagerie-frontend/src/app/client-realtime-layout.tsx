'use client';

import { useUser } from "@clerk/nextjs";
import { useRealtime } from "@/hooks/useRealtime";
import Header from "@/component/header";
import Footer from "@/component/footer";

export default function ClientRealtimeLayout({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    const { user } = useUser();
    const userId = user?.id;

    useRealtime(userId);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <header className="flex-shrink-0">
                <Header />
            </header>

            <main className="flex-1 flex flex-col min-h-0 px-4 py-4">
                {children}
            </main>

            <footer className="flex-shrink-0">
                <Footer />
            </footer>
        </div>
    );
}
