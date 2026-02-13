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

    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = listenToUserBookings(currentUser.uid, setBookings);
        return () => unsubscribe();
    }, [currentUser]);

    const handleBookNow = async () => {
        if (!selectedService || !currentUser) return;
        setLoading(true);
        try {
            if (!navigator.geolocation) { alert("Geolocation needed"); setLoading(false); return; }

            navigator.geolocation.getCurrentPosition(async (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                const bid = await createBooking(currentUser.uid, userProfile?.name || 'User', selectedService.id, loc);
                await runAutoAssignment(bid, { serviceType: selectedService.id, userLocation: loc });
                setSelectedService(null);
                setLoading(false);
            }, () => { setLoading(false); alert("Loc error"); });
        } catch (e) { console.error(e); setLoading(false); }
    };

    const activeBooking = bookings.find(b => ['searching', 'pending_acceptance', 'assigned', 'in_progress'].includes(b.status));

    return (
        <div className="pt-20 pb-10 min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">

                {/* Left Column: Actions */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                    {/* Welcome Card */}
                    <div className="card p-6 bg-white">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Hello, {userProfile?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-slate-500 text-sm">Need help today?</p>
                    </div>

                    {/* Active Booking Status */}
                    {activeBooking ? (
                        <div className="card p-6 bg-blue-50 border-blue-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                                    {SERVICE_TYPES.find(s => s.id === activeBooking.serviceType)?.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Current Request</h3>
                                    <StatusBadge status={activeBooking.status} />
                                </div>
                            </div>

                            {activeBooking.status === 'searching' && (
                                <div className="text-sm text-slate-600 animate-pulse">Scanning for nearby helpers...</div>
                            )}

                            {activeBooking.helperName && (
                                <div className="bg-white p-3 rounded-lg border border-blue-100 mt-2">
                                    <p className="font-bold text-slate-900">Helper: {activeBooking.helperName}</p>
                                    <p className="text-xs text-slate-500">ETA: {activeBooking.eta || 'Calculating...'}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Service Selection */
                        <div className="card p-6 bg-white">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Select Service</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {SERVICE_TYPES.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className={`p-4 rounded-xl border text-center transition-all
                         ${selectedService?.id === service.id
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'}`}
                                    >
                                        <div className="text-2xl mb-1">{service.icon}</div>
                                        <div className="text-xs font-bold">{service.label}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleBookNow}
                                    disabled={!selectedService || loading}
                                    className={`w-full btn ${!selectedService ? 'bg-slate-100 text-slate-400' : 'btn-primary'}`}
                                >
                                    {loading ? 'Requesting...' : 'Book Now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Recent History */}
                    <div className="card p-6 bg-white">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {bookings.slice(0, 3).map(b => (
                                <div key={b.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">{b.serviceType}</span>
                                    <span className="text-slate-400 text-xs">{formatDistanceToNow(new Date(b.createdAt.seconds * 1000))} ago</span>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-slate-400 text-sm">No history yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Standard Map Component */}
                <div className="lg:col-span-2 card overflow-hidden bg-slate-200 relative h-full min-h-[500px]">
                    <LiveMap bookings={bookings} userLocation={null} role="user" />
                </div>

            </div>
        </div>
    );
}
