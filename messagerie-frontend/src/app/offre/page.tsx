import Pricing from "@/component/pricing";

export default function PricingPage() {
    return (
        <main className="flex-1 bg-white text-gray-800 overflow-y-auto">
            <section className="text-center py-2 px23 bg-gradient-to-br from-blue-50 to-white">
                <h1 className="text-4xl font-bold mb-4">Découvrez nos offres</h1>
                <p className="text-gray-600 text-lg mb-5">
                    Choisissez le plan qui vous convient le mieux.
                </p>
            </section>
            <Pricing />
        </main>
    );
}