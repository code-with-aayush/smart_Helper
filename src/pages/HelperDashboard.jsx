import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { SERVICE_TYPES } from '../utils/seedData';
import { formatDistanceToNow } from 'date-fns';

export default function HelperDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [isAvailable, setIsAvailable] = useState(userProfile?.status === 'available');
    const [incomingBooking, setIncomingBooking] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [locationSharing, setLocationSharing] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [myLocation, setMyLocation] = useState(null);

    // Sync status
    useEffect(() => {
        if (userProfile) {
            setIsAvailable(userProfile.status === 'available');
        }
    }, [userProfile]);

    // Toggle Availability
    const toggleAvailability = async () => {
        try {
            const newStatus = isAvailable ? 'busy' : 'available';
            await updateDoc(doc(db, 'helpers', currentUser.uid), { status: newStatus });
            await updateDoc(doc(db, 'users', currentUser.uid), { status: newStatus });
            setIsAvailable(!isAvailable);
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Toggle GPS
    const toggleLocationSharing = () => {
        if (locationSharing) {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setLocationSharing(false);
            setMyLocation(null);
        } else {
            if (!navigator.geolocation) {
                alert("Geolocation not supported");
                return;
            }
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMyLocation({ lat: latitude, lng: longitude });
                    updateDoc(doc(db, 'helpers', currentUser.uid), { location: { latitude, longitude } }).catch(console.error);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
            setWatchId(id);
            setLocationSharing(true);
        }
    };

    // Listen for Incoming
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'bookings'),
            where('helperId', '==', currentUser.uid),
            where('status', '==', 'pending_acceptance')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setIncomingBooking({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setIncomingBooking(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Listen for Active
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'bookings'),
            where('helperId', '==', currentUser.uid),
            where('status', 'in', ['assigned', 'in_progress'])
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setActiveJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleAccept = async () => {
        if (!incomingBooking) return;
        await updateDoc(doc(db, 'bookings', incomingBooking.id), { status: 'assigned' });
    };

    const handleReject = async () => {
        if (!incomingBooking) return;
        await updateDoc(doc(db, 'bookings', incomingBooking.id), { status: 'searching', helperId: null });
    };

    const markJobComplete = async (bookingId) => {
        await updateDoc(doc(db, 'bookings', bookingId), { status: 'completed', completedAt: new Date() });
    };

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-100 font-sans">

            {/* Full Map Background */}
            <div className="absolute inset-0 z-0">
                <LiveMap bookings={activeJobs} userLocation={myLocation} role="helper" />
            </div>

            {/* Top Status Bar (Floating) */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/40 flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`}></div>
                    <span className="font-bold text-slate-700 text-sm">{isAvailable ? 'Online & Available' : 'Offline'}</span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <button
                    onClick={toggleAvailability}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors ${isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                    {isAvailable ? 'Go Offline' : 'Go Online'}
                </button>
            </div>

            {/* GPS Toggle (Top Right) */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={toggleLocationSharing}
                    className={`p-3 rounded-full shadow-lg transition-all ${locationSharing ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    title="Toggle GPS"
                >
                    <span className="text-xl">📍</span>
                </button>
            </div>

            {/* Incoming Booking MODAL (Centered) */}
            {incomingBooking && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-white transform transition-all scale-100">
                        {/* Header */}
                        <div className="bg-blue-600 p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>

                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Priority Dispatch Assigned</p>
                            {/* Countdown Timer Circle (Static for now) */}
                            <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl shadow-lg relative">
                                <span>30s</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-white" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white relative z-10">
                                {incomingBooking.serviceType} Request
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl text-blue-600">
                                    {SERVICE_TYPES.find(s => s.id === incomingBooking.serviceType)?.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Detailed Cleaning</h3>
                                    <p className="text-slate-500 text-sm">Residential • 4.2 km away</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="font-bold text-green-600 text-xl">$45.00</div>
                                    <div className="text-xs text-slate-400">Est. Payout</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=${incomingBooking.userName}&background=random`} alt="User" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-900">{incomingBooking.userName}</div>
                                    <div className="text-xs text-slate-500">4.8 Rating • 12 Jobs</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button onClick={handleReject} className="btn bg-slate-100 text-slate-600 hover:bg-slate-200 w-full">Decline</button>
                                <button onClick={handleAccept} className="btn btn-primary w-full shadow-lg shadow-blue-500/30">Accept Job ⚡</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Job Floating Panel (Bottom) */}
            {activeJobs.length > 0 && !incomingBooking && (
                <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center pointer-events-none">
                    {activeJobs.map(job => (
                        <div key={job.id} className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 pointer-events-auto overflow-hidden flex flex-col md:flex-row">
                            <div className="bg-blue-600 p-6 flex flex-col justify-center text-white min-w-[200px]">
                                <div className="text-xs opacity-70 uppercase tracking-wider mb-2">Current Job</div>
                                <div className="text-2xl font-bold mb-1">{job.serviceType}</div>
                                <div className="flex items-center gap-2 text-sm opacity-90">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    In Progress
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{job.userName}</h4>
                                        <p className="text-slate-500 text-sm">123 Main St, Apt 4B</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">📞</button>
                                        <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">💬</button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => markJobComplete(job.id)}
                                    className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                >
                                    Mark Complete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
