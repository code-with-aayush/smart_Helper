import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <div className="space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Trusted by 50,000+ Homeowners
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            Get Professional Help in <span className="text-blue-600">15 Minutes</span>
                        </h1>

                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            Don't wait days for quotes. Our smart auto-dispatch system connects you with verified pros in your area instantly. Quick, reliable, and guaranteed.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {currentUser ? (
                                <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-blue-500/20">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link to="/register" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-blue-500/20">
                                    Find a Helper
                                </Link>
                            )}
                            <Link to="/helper" className="btn btn-secondary text-lg px-8 py-4">
                                Become a Pro
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 pt-4">
                            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Instant Booking</span>
                            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Verified Pros</span>
                            <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Flat Pricing</span>
                        </div>
                    </div>

                    {/* Hero Image / Graphic */}
                    <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                            {/* Abstract UI Representation */}
                            <div className="text-center relative z-10">
                                <div className="w-24 h-24 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">
                                    <span className="text-5xl animate-bounce">⚡</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2 font-heading">SERVICE</h3>
                                <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mt-4"></div>
                            </div>

                            {/* Floating Elements mimicking the reference */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-slate-800"></div>
                                    <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-slate-800"></div>
                                    <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-slate-800"></div>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">42 Pro Helpers</p>
                                    <p className="text-slate-400 text-xs">Available now in your area</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-100 rounded-full blur-3xl -z-10"></div>
                    </div>

                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Specialized Services</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Select a category and our system will match you with the highest-rated professional nearby.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {['Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Gardening', 'Moving'].map(service => (
                            <div key={service} className="p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-slate-100 group text-center">
                                <div className="w-12 h-12 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="text-2xl text-blue-600">🛠️</span>
                                </div>
                                <span className="font-semibold text-slate-700 block">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">How Smart Assignment Works</h2>
                            <p className="text-slate-500 max-w-xl">Our advanced dispatch technology eliminates the back-and-forth.</p>
                        </div>
                        <a href="#" className="text-blue-600 font-semibold hover:underline hidden sm:block">Learn about our AI →</a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-dashed border-t-2 border-slate-200 border-dashed -z-10"></div>

                        {[
                            { step: '01', title: 'Request Service', desc: 'Simply select your service and location. No complex forms needed.' },
                            { step: '02', title: 'Auto-Dispatch', desc: 'Our system scans for the closest, highest rated pro who specializes in your exact needs.' },
                            { step: '03', title: 'Help Arrives', desc: 'Your helper arrives within 15-30 minutes. Pay securely app once finished.' }
                        ].map((item) => (
                            <div key={item.step} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-blue-500/30">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer / Stats */}
            <div className="bg-blue-600 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold font-heading mb-1">15m</div>
                        <div className="text-blue-100 text-sm">Avg. Arrival Time</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold font-heading mb-1">12k+</div>
                        <div className="text-blue-100 text-sm">Verified Pros</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold font-heading mb-1">4.9/5</div>
                        <div className="text-blue-100 text-sm">Service Rating</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold font-heading mb-1">24/7</div>
                        <div className="text-blue-100 text-sm">Support Available</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
