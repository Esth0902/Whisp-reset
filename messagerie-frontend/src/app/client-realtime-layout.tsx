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
        <>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            <Footer />
        </>
    );
}
