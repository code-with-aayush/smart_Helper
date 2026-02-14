import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col min-h-screen font-sans">

            {/* 1. Hero Section with Background Image Overlay */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1581578731117-104f8a746950?q=80&w=2070&auto=format&fit=crop"
                        alt="Home Service Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 container-max text-center px-4 animate-in">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/30 border border-blue-400 text-blue-100 backdrop-blur-md text-sm font-semibold mb-6">
                        ✨ #1 On-Demand Service Platform
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Expert Help, <br />
                        <span className="text-blue-400">Right at Your Doorstep.</span>
                    </h1>
                    <p className="text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Instant access to verified cleaners, plumbers, and electricians.
                        No phone calls. No waiting. Just book and relax.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {currentUser ? (
                            <Link to="/dashboard?tab=book" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-blue-900/20">
                                Book a Service Now
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-blue-900/20">
                                    Get Started
                                </Link>
                                <Link to="/login" className="px-8 py-4 rounded-lg bg-white/10 text-white font-semibold backdrop-blur-md hover:bg-white/20 transition-all border border-white/20">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Stats Bar */}
            <section className="bg-white border-b border-slate-100 py-6 relative z-20 -mt-8 mx-4 md:mx-auto max-w-5xl rounded-2xl shadow-xl flex flex-wrap justify-around items-center text-center">
                {[
                    { label: 'Verified Pros', value: '500+' },
                    { label: 'Jobs Completed', value: '12k+' },
                    { label: 'Happy Customers', value: '98%' },
                    { label: 'Cities Covered', value: '15' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 w-1/2 md:w-auto">
                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
                    </div>
                ))}
            </section>

            {/* 3. Popular Layouts (Image Grid) */}
            <section className="py-24 bg-slate-50">
                <div className="container-max px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Popular Services</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">From deep cleaning to emergency repairs, we have you covered.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Home Cleaning', icon: '🧹', color: 'bg-blue-100 text-blue-600', price: 'from $25/hr', desc: 'Spotless cleaning for every room.' },
                            { title: 'Plumbing Repair', icon: '🔧', color: 'bg-cyan-100 text-cyan-600', price: 'from $40/hr', desc: 'Fix leaks and pipes instantly.' },
                            { title: 'Electrical Help', icon: '⚡', color: 'bg-yellow-100 text-yellow-600', price: 'from $35/hr', desc: 'Expert wiring and repairs.' },
                            { title: 'Moving & Packing', icon: '📦', color: 'bg-orange-100 text-orange-600', price: 'from $50/hr', desc: 'Safe relocation services.' }
                        ].map((service, i) => (
                            <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-full ${service.color} flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                                <p className="text-slate-500 text-sm mb-4">{service.desc}</p>
                                <div className="mt-auto w-full">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{service.price}</div>
                                    <Link
                                        to={currentUser ? "/dashboard?tab=book" : "/register"}
                                        className="block w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. How It Works (Steps) */}
            <section className="py-24 bg-white">
                <div className="container-max px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
                        <img
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
                            alt="App on Phone"
                            className="relative rounded-3xl shadow-2xl border-4 border-white"
                        />

                        {/* Floating Badge */}
                        <div className="absolute bottom-10 right-[-20px] bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                            <div>
                                <div className="text-sm font-bold">Helper Arrived</div>
                                <div className="text-xs text-slate-400">2 mins ago</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Book in 3 Simple Steps.</h2>
                        <p className="text-slate-500 text-lg mb-10">Our smart algorithm finds you the nearest available professional in seconds.</p>

                        <div className="space-y-8">
                            {[
                                { step: '01', title: 'Select Service', desc: 'Choose from Cleaning, Plumbing, or Electrical.' },
                                { step: '02', title: 'Instant Match', desc: 'We pair you with a top-rated pro nearby.' },
                                { step: '03', title: 'Relax & Track', desc: 'Watch them arrive on the live map.' }
                            ].map((s, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                                        <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link to="/register" className="btn btn-primary px-8">Try it now</Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* 5. Trust Section */}
            <section className="py-24 bg-slate-900 text-white text-center">
                <div className="container-max px-4">
                    <h2 className="text-3xl font-bold mb-12">Trusted by 10,000+ Homeowners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { text: "Detailed cleaning and super polite helper. The live tracking feature is a game changer!", name: "Sarah J.", role: "Homeowner" },
                            { text: "My pipe burst and I had a plumber at my door in 20 minutes. Incredible speed.", name: "Mike T.", role: "Business Owner" },
                            { text: "I love that I can see the price upfront. No hidden fees or haggling.", name: "Emily R.", role: "Designer" }
                        ].map((review, i) => (
                            <div key={i} className="bg-slate-800 p-8 rounded-2xl relative">
                                <div className="text-4xl text-blue-500 absolute top-4 left-6">"</div>
                                <p className="text-slate-300 mb-6 relative z-10">{review.text}</p>
                                <div className="font-bold">{review.name}</div>
                                <div className="text-sm text-slate-500">{review.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="container-max text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl">⚡</span>
                        <span className="font-bold text-xl text-slate-900">SmartHelper</span>
                    </div>
                    <p className="text-slate-400">© 2026 SmartHelper Inc. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}
