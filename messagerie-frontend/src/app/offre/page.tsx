import Pricing from "@/component/pricing";
export default function PricingPage() {
    return (
        <main className="min-h-screen bg-white text-gray-800">
            <section className="text-center py-5 px-6 bg-gradient-to-br from-blue-50 to-white">
                <h1 className="text-4xl font-bold mb-6">Découvrez nos offres</h1>
                <p className="text-gray-600 text-lg mb-12">
                    Choisissez le plan qui vous convient le mieux.
                </p>
            </section>
            <Pricing />
        </main>
    );
}