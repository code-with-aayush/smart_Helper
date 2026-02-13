import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">

            {/* Hero Section */}
            <section className="bg-white border-b border-slate-100 pt-32 pb-24">
                <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <div className="space-y-6 animate-in">
                        <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                            New: AI-Powered Matches
                        </span>
                        <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                            Professional Helpers, <br />
                            <span className="text-blue-600">On Demand.</span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                            The smartest way to book local professionals. from cleaning to repairs, get matched with verified experts in your area instantly.
                        </p>

                        <div className="flex gap-4 pt-4">
                            {currentUser ? (
                                <Link to="/dashboard" className="btn btn-primary text-lg px-8">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary text-lg px-8">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="btn btn-outline text-lg px-8">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-in" style={{ animationDelay: '0.1s' }}>
                        {/* Abstract UI Representation */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-50 to-white">
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚡</div>
                                <h3 className="text-2xl font-bold text-slate-800">Smart Assignment</h3>
                                <div className="mt-4 flex flex-col gap-2 opacity-50">
                                    <div className="h-2 w-32 bg-slate-300 rounded-full mx-auto"></div>
                                    <div className="h-2 w-24 bg-slate-300 rounded-full mx-auto"></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute top-10 right-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                            <span className="text-green-500 font-bold">✓ Match Found</span>
                        </div>
                        <div className="absolute bottom-10 left-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                            <span className="text-blue-600 font-bold">Active: 120+ Pros</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="container-max">
                    <div className="text-center mb-16 px-4">
                        <h2 className="text-3xl font-bold mb-4">Why Choose SmartHelper?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">We use advanced logic to pair you with the perfect professional, considering location, expertise, and rating.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {[
                            { icon: '🎯', title: 'Instant Matching', desc: 'Our algorithm finds the closest available pro.' },
                            { icon: '🛡️', title: 'Verified Experts', desc: 'Every helper is vetted and background checked.' },
                            { icon: '💳', title: 'Transparent Pricing', desc: 'Know the cost upfront. No hidden fees.' }
                        ].map((feature, i) => (
                            <div key={i} className="card p-8 bg-white hover:border-blue-200 transition-colors">
                                <div className="text-4xl mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services List */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="container-max">
                    <h2 className="text-3xl font-bold mb-12 px-4">Available Services</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
                        {['Cleaning', 'Plumbing', 'Electrical', 'Moving', 'Painting', 'Gardening'].map(s => (
                            <div key={s} className="p-4 rounded-lg bg-slate-50 text-center font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border border-transparent hover:border-blue-100">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
                <div className="container-max text-center">
                    <p>© 2026 SmartHelper Inc. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}
