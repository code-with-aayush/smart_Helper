import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, listenToUserBookings, updateBookingStatus } from '../services/bookingService';
import { SERVICE_TYPES } from '../utils/seedData';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';

export default function UserDashboard() {
    const { currentUser, userProfile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Read active tab from URL query param, default to 'book'
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab') || 'book';

    const [bookings, setBookings] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    // Booking Form State
    const [bookingStep, setBookingStep] = useState(1);
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = listenToUserBookings(currentUser.uid, setBookings);
        return () => unsubscribe();
    }, [currentUser]);

    const activeBooking = bookings.find(b => ['searching', 'pending_acceptance', 'assigned', 'in_progress'].includes(b.status));
    const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

    // Reset booking form when service is cleared
    useEffect(() => {
        if (!selectedService) {
            setBookingStep(1);
            setDescription('');
            setAddress('');
            setPrice('');
        }
    }, [selectedService]);

    const handleBookNow = async () => {
        if (!selectedService || !currentUser) return;
        setLoading(true);

        // Geolocation Fallback for Hackathon
        const getLocation = () => new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
                    () => resolve({ latitude: 40.7128, longitude: -74.0060 }) // Default NYC
                );
            } else {
                resolve({ latitude: 40.7128, longitude: -74.0060 });
            }
        });

        try {
            const userLocation = await getLocation();

            const bookingId = await createBooking(
                currentUser.uid,
                userProfile?.name || 'User',
                selectedService.id,
                userLocation,
                { description, address, price: price || 'Negotiable' }
            );

            // BROADCAST MODE: Do NOT Assign specific helper. 
            // Leave status as 'searching' so ALL helpers see it.
            // await runAutoAssignment(bookingId, { serviceType: selectedService.id, userLocation });

            setSelectedService(null);
            navigate('?tab=history');
            setLoading(false);

        } catch (e) { console.error(e); alert("Failed to post request."); setLoading(false); }
    };

    const handleCancelBooking = async () => {
        if (!activeBooking) return;
        if (window.confirm("Are you sure you want to cancel this request?")) {
            try {
                await updateBookingStatus(activeBooking.id, 'cancelled');
                navigate('?tab=book'); // Go back to booking form
            } catch (e) { console.error(e); alert("Failed to cancel."); }
        }
    };

    return (
        <div className="pt-24 pb-10 min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* VIEW: BOOK SERVICE */}
                {activeTab === 'book' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
                        {/* Left Panel: Booking Form */}
                        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span>⚡</span> Request Service
                                </h2>

                                {activeBooking ? (
                                    <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                                            {SERVICE_TYPES.find(s => s.id === activeBooking.serviceType)?.icon}
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-1">Looking for a Pro...</h3>
                                        <StatusBadge status={activeBooking.status} />

                                        <div className="mt-6 space-y-3">
                                            <button onClick={() => navigate('?tab=history')} className="w-full btn bg-blue-600 hover:bg-blue-700 text-white">View Status</button>
                                            <button onClick={handleCancelBooking} className="w-full btn bg-white border border-red-200 text-red-600 hover:bg-red-50">Stop Search</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {bookingStep === 1 && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {SERVICE_TYPES.map(service => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => { setSelectedService(service); setBookingStep(2); }}
                                                        className="p-4 rounded-xl border bg-slate-50 border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-md transition-all text-center group"
                                                    >
                                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{service.icon}</div>
                                                        <div className="text-sm font-bold text-slate-700">{service.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {bookingStep === 2 && selectedService && (
                                            <div className="space-y-4 animate-in">
                                                <button onClick={() => setBookingStep(1)} className="text-sm text-slate-500 hover:text-slate-900 mb-2 flex items-center gap-1">← Change Service</button>

                                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{selectedService.icon}</span>
                                                        <span className="font-bold text-blue-900">{selectedService.label}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Task Details</label>
                                                    <textarea
                                                        className="input-base mt-1 h-24"
                                                        placeholder="Describe the issue..."
                                                        value={description}
                                                        onChange={e => setDescription(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                                    <input
                                                        className="input-base mt-1"
                                                        placeholder="123 Main St"
                                                        value={address}
                                                        onChange={e => setAddress(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Offer Price ($)</label>
                                                    <input
                                                        type="number"
                                                        className="input-base mt-1"
                                                        placeholder="e.g. 50"
                                                        value={price}
                                                        onChange={e => setPrice(e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleBookNow}
                                                    disabled={loading}
                                                    className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-blue-500/20 mt-4"
                                                >
                                                    {loading ? 'Processing...' : 'Find Helper Now'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Map */}
                        <div className="lg:col-span-2 card overflow-hidden bg-slate-200 border-0 shadow-lg h-full relative">
                            <LiveMap bookings={bookings} role="user" />
                        </div>
                    </div>
                )}

                {/* VIEW: HISTORY / ACTIVITY */}
                {activeTab === 'history' && (
                    <div className="max-w-3xl mx-auto animate-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Activity History</h2>

                        {activeBooking && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Live Now</h3>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-900">{activeBooking.serviceType}</h4>
                                            <p className="text-slate-500">{activeBooking.address}</p>
                                        </div>
                                        <StatusBadge status={activeBooking.status} />
                                    </div>

                                    <div className="mt-6 flex items-center gap-4 pt-6 border-t border-slate-100">
                                        {activeBooking.helperName ? (
                                            <>
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">👷</div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{activeBooking.helperName}</div>
                                                    <div className="text-sm text-green-600 font-medium">Arriving in {activeBooking.eta || '10m'}</div>
                                                </div>
                                                <button className="ml-auto btn btn-primary text-sm px-6">Track Live</button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-3 text-slate-500 w-full justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <span>Searching for nearby professionals...</span>
                                                </div>
                                                <button onClick={handleCancelBooking} className="text-red-500 text-sm font-medium hover:underline">Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Past Bookings</h3>
                            <div className="space-y-4">
                                {pastBookings.map(b => (
                                    <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl">
                                                {SERVICE_TYPES.find(s => s.id === b.serviceType)?.icon || '⚡'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{b.serviceType}</div>
                                                <div className="text-xs text-slate-500">{new Date(b.createdAt.seconds * 1000).toDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900">$45.00</div>
                                            <StatusBadge status={b.status} />
                                        </div>
                                    </div>
                                ))}
                                {pastBookings.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-400">No past history found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
