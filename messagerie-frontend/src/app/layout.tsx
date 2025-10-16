import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import ClientRealtimeLayout from "./client-realtime-layout";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Whisp",
    description: "Application de messagerie instantanée",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider>
            <html lang="fr">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50`}
            >
            <ClientRealtimeLayout>{children}</ClientRealtimeLayout>
            <Toaster position="top-right" />
            </body>
            </html>
        </ClerkProvider>
    );
}

