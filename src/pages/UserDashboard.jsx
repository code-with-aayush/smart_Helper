import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, listenToUserBookings } from '../services/bookingService';
import { runAutoAssignment } from '../services/assignmentService';
import { SERVICE_TYPES } from '../utils/seedData';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Listen to real-time bookings
    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = listenToUserBookings(currentUser.uid, (data) => {
            setBookings(data);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Handle "Book Now"
    const handleBookNow = async () => {
        if (!selectedService || !currentUser) return;

        setLoading(true);
        try {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const bookingId = await createBooking(
                    currentUser.uid,
                    userProfile?.name || 'User',
                    selectedService.id,
                    userLocation
                );

                await runAutoAssignment(bookingId, {
                    serviceType: selectedService.id,
                    userLocation: userLocation
                });

                setSelectedService(null);
                setLoading(false);
            }, (error) => {
                console.error("Error:", error);
                alert("Unable to retrieve location.");
                setLoading(false);
            });

        } catch (error) {
            console.error("Booking failed:", error);
            alert("Booking failed.");
            setLoading(false);
        }
    };

    const activeBooking = bookings.find(b =>
        ['searching', 'pending_acceptance', 'assigned', 'in_progress'].includes(b.status)
    );

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100">

            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
                <LiveMap bookings={bookings} userLocation={null} role="user" />
            </div>

            {/* Floating Sidebar (Left) */}
            <div className={`absolute top-4 left-4 h-[calc(100%-2rem)] w-full max-w-sm bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 flex flex-col transition-transform duration-300 z-10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}>

                {/* Toggle Button (Mobile) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-12 top-0 bg-white p-2 rounded-r-xl shadow-md md:hidden"
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>

                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 font-heading">Book Service</h2>
                    <p className="text-slate-500 text-sm">Select a professional to help you</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeBooking ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center animate-fade-in">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-pulse">
                                    {SERVICE_TYPES.find(s => s.id === activeBooking.serviceType)?.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {activeBooking.status === 'searching' ? 'Finding your Pro...' :
                                        activeBooking.status === 'pending_acceptance' ? 'Waiting for confirmation...' :
                                            'Helper Assigned!'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    {activeBooking.status === 'searching' ? 'Scanning nearby helpers matching your request.' :
                                        'Your helper will be with you shortly.'}
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <StatusBadge status={activeBooking.status} />
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Service</span>
                                    <span className="font-semibold text-slate-900">{activeBooking.serviceType}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Order ID</span>
                                    <span className="font-mono text-slate-900">#{activeBooking.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Time</span>
                                    <span className="text-slate-900">{formatDistanceToNow(new Date(activeBooking.createdAt.seconds * 1000))} ago</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {SERVICE_TYPES.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-4 rounded-xl text-left transition-all border
                        ${selectedService?.id === service.id
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{service.icon}</div>
                                    <div className="font-bold text-sm text-slate-900">{service.label}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Action Area */}
                {!activeBooking && (
                    <div className="p-6 border-t border-slate-100 bg-white/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase">Est. Price</div>
                            <div className="text-lg font-bold text-slate-900">$25 - $40<span className="text-xs text-slate-400 font-normal">/hr</span></div>
                        </div>
                        <button
                            onClick={handleBookNow}
                            disabled={!selectedService || loading}
                            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg
                    ${(!selectedService || loading)
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'btn-primary shadow-blue-500/30 hover:transform hover:-translate-y-1'
                                }
                  `}
                        >
                            {loading ? 'Processing...' : selectedService ? `Request ${selectedService.label}` : 'Select Service'}
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Status Card (Top Right - Active Job) */}
            {activeBooking && activeBooking.eta && (
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 max-w-xs animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 leading-none">{activeBooking.eta}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Mins</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div>
                            <div className="text-sm font-bold text-slate-900">Arriving Soon</div>
                            <div className="text-xs text-slate-500">Helper is on the way</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Helper Info Floating Card (Bottom Center - Active Job) */}
            {activeBooking && activeBooking.helperName && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
                    <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                                {/* Placeholder Avatar */}
                                <img src={`https://ui-avatars.com/api/?name=${activeBooking.helperName}&background=0D8ABC&color=fff`} alt="Helper" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{activeBooking.helperName}</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <span className="text-yellow-500">★ 4.9</span>
                                    <span>• {activeBooking.serviceType} Pro</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                📞
                            </button>
                            <button className="p-3 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                💬
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
