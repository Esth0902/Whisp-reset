'use client';

import { SignInButton } from '@clerk/nextjs';

export default function PricingSection() {
    return (
        <section className="py-12 px-6 bg-white">
            <h2 className="text-4xl font-bold text-center mb-12">Nos offres</h2>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="border rounded-xl p-8 shadow-sm hover:shadow-md transition">
                    <h3 className="text-2xl font-semibold mb-2">Free</h3>
                    <p className="text-gray-500 mb-6">Parfait pour commencer</p>
                    <ul className="space-y-3 text-gray-700 text-sm">
                        <li>✔️ 100 messages / mois</li>
                        <li>✔️ 10 Mo de pièces jointes</li>
                        <li>✔️ Jusqu’à 3 membres / conversation</li>
                        <li>✔️ Rétention des messages : 7 jours</li>
                    </ul>
                    <p className="mt-6 text-2xl font-bold">Gratuit</p>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-blue-600 rounded-xl p-8 shadow-lg bg-blue-50">
                    <h3 className="text-2xl font-semibold mb-2 text-blue-700">Pro</h3>
                    <p className="text-blue-600 mb-6">Pour les utilisateurs exigeants</p>
                    <ul className="space-y-3 text-blue-800 text-sm">
                        <li>🚀 Messages illimités</li>
                        <li>🚀 5 Go de pièces jointes</li>
                        <li>🚀 Jusqu’à 50 membres / conversation</li>
                        <li>🚀 Rétention illimitée</li>
                        <li>🚀 Support prioritaire</li>
                    </ul>
                    <p className="mt-6 text-2xl font-bold text-blue-700">9,99 €/mois</p>


                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/sign-up`}
                        className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
                    >
                        Commencez votre essai gratuit
                    </a>


                </div>
            </div>
        </section>
    );
}