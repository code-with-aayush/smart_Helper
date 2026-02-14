import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { listenToOpenBookings, assignBookingToSelf, declineBooking, completeBooking } from '../services/bookingService';

export default function HelperDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAvailable, setIsAvailable] = useState(userProfile?.status === 'available');
    const [incomingBooking, setIncomingBooking] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [stats, setStats] = useState({ earnings: 0, jobs: 0, rating: 4.8 });

    // Use a ref for location so we can access the latest value inside the Firestore callback
    // without triggering re-subscriptions or stale closures.
    const helperLocationRef = useRef({ lat: 40.7128, lng: -74.0060 }); // Default NYC

    // Sync Availability
    useEffect(() => {
        if (userProfile) setIsAvailable(userProfile.status === 'available');
    }, [userProfile]);

    // Toggle Availability
    const toggleAvailability = async () => {
        try {
            const newStatus = isAvailable ? 'busy' : 'available';
            await updateDoc(doc(db, 'helpers', currentUser.uid), { status: newStatus });
            setIsAvailable(!isAvailable);
        } catch (err) { console.error(err); }
    };

    // Get Location (Once on mount + periodically?)
    useEffect(() => {
        if (navigator.geolocation) {
            const updateLoc = () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        helperLocationRef.current = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        console.log("Helper location updated:", helperLocationRef.current);
                    },
                    (err) => console.error("Location error:", err),
                    { enableHighAccuracy: true }
                );
            };
            updateLoc();
            // Optional: Watch position? For now, just getting it once is fine for the hackathon
        }
    }, []);

    // Listen for Active Jobs (My Jobs)
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'bookings'),
            where('assignedHelper', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const myBookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const active = myBookings.filter(b => ['assigned', 'in_progress'].includes(b.status));
            setActiveJobs(active);
            const history = myBookings.filter(b => ['completed', 'cancelled'].includes(b.status));
            setCompletedJobs(history);
            const completedCount = history.filter(b => b.status === 'completed').length;
            setStats(s => ({ ...s, jobs: completedCount, earnings: completedCount * 45 }));
        });

        return () => unsubscribe();
    }, [currentUser]);


    // Listen for Open Requests
    useEffect(() => {
        // Always listen if user is logged in and "Available"
        if (!currentUser || !isAvailable) {
            setIncomingBooking(null);
            return;
        }

        console.log("Starting listener for open bookings...");

        const unsubscribe = listenToOpenBookings((bookings) => {
            console.log("Open bookings received:", bookings);

            // 1. Filter out rejected bookings
            const candidates = bookings.filter(b =>
                !b.rejectedHelpers?.includes(currentUser.uid)
            );

            if (candidates.length > 0) {
                // Take the most recent one (or first one)
                const relevantBooking = candidates[0];
                setIncomingBooking(relevantBooking);
            } else {
                setIncomingBooking(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser, isAvailable]);

    const handleBookingAction = async (id, action) => {
        if (!incomingBooking && action !== 'complete') return; // incomingBooking might be null for 'complete' action if it's from active list

        // Use the ref for immediate location access
        const loc = helperLocationRef.current;
        const helperLocation = {
            latitude: loc.lat,
            longitude: loc.lng,
            address: 'Live Location'
        };

        try {
            if (action === 'accept') {
                await assignBookingToSelf(id, currentUser.uid, userProfile.name, helperLocation);
                setIncomingBooking(null);
                setActiveTab('active'); // Go to Active Jobs
            }
            if (action === 'reject') {
                await declineBooking(id, currentUser.uid);
                setIncomingBooking(null);
            }
            if (action === 'complete') {
                await completeBooking(id, currentUser.uid);
                setActiveTab('history'); // Go to History
            }
        } catch (error) {
            console.error("Action failed:", error);
            alert("Action failed. Please try again.");
        }
    };

    return (
        <div className="pt-20 pb-10 min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="card p-6 bg-white text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-200 rounded-full overflow-hidden mb-4 border-4 border-slate-50 shadow-sm">
                            <img src={`https://ui-avatars.com/api/?name=${userProfile?.name}&background=0F172A&color=fff`} alt="Profile" />
                        </div>
                        <h2 className="font-bold text-lg text-slate-900">{userProfile?.name}</h2>
                        <div className="flex justify-center items-center gap-2 mt-1 mb-4">
                            <span className="text-sm text-slate-500 capitalize">{userProfile?.skills?.[0] || 'Helper'}</span>
                            <span className="text-yellow-500 text-sm">★ {stats.rating}</span>
                        </div>

                        <button
                            onClick={toggleAvailability}
                            className={`w-full py-2 rounded-lg font-semibold text-sm transition-all border
                  ${isAvailable
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                        >
                            {isAvailable ? '● Online' : '○ Offline'}
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="card bg-white overflow-hidden">
                        {['overview', 'active', 'history'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors capitalize font-medium
                     ${activeTab === tab ? 'text-blue-600 bg-blue-50/50 border-l-4 border-l-blue-600' : 'text-slate-600 border-l-4 border-l-transparent'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Incoming Request Banner */}
                    {incomingBooking && (
                        <div className="card p-6 bg-blue-600 text-white animate-in shadow-xl shadow-blue-500/20 border-none relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm shrink-0">🔔</div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">New Job Request</h3>
                                        <div className="flex justify-between items-center w-full">
                                            <div className="text-blue-100 font-medium mb-1 text-lg">{incomingBooking.serviceType}</div>
                                            {incomingBooking.price && (
                                                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                                    ${incomingBooking.price}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-blue-200 text-sm mb-2">
                                            <span className="font-bold">{incomingBooking.userName}</span> • 4.9 ★
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-lg text-sm text-blue-50 mb-1">
                                            <p className="line-clamp-2">"{incomingBooking.description || 'No description provided.'}"</p>
                                        </div>
                                        <div className="text-xs text-blue-200 flex items-center gap-1 mt-2">
                                            <span>📍</span> {incomingBooking.address || 'Location provided on map'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto mt-auto">
                                    <button
                                        onClick={() => handleBookingAction(incomingBooking.id, 'reject')}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-colors"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleBookingAction(incomingBooking.id, 'accept')}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors shadow-lg"
                                    >
                                        Accept Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Content */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Row REMOVED for clean look */}

                            {/* Active Jobs Section */}
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg mb-4">Active Jobs</h3>
                                {activeJobs.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeJobs.map(job => (
                                            <div key={job.id} className="card p-6 bg-white border-l-4 border-l-green-500">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg">{job.serviceType}</h4>
                                                        <p className="text-slate-500 text-sm font-medium">{job.userName}</p>
                                                        <p className="text-slate-400 text-xs mt-1">{job.address}</p>
                                                    </div>
                                                    <StatusBadge status={job.status} />
                                                </div>

                                                <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm text-slate-600 italic border border-slate-100">
                                                    "{job.description || 'No additional details provided.'}"
                                                </div>

                                                <div className="h-48 bg-slate-100 rounded-lg mb-4 overflow-hidden border border-slate-200 relative">
                                                    <LiveMap bookings={[job]} role="helper" />
                                                </div>

                                                <div className="flex gap-3">
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${job.userLocation.latitude},${job.userLocation.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 btn btn-outline border-slate-200 hover:bg-slate-50 text-center flex items-center justify-center gap-2"
                                                    >
                                                        <span>🧭</span> Navigate
                                                    </a>
                                                    <a
                                                        href="tel:1234567890"
                                                        className="flex-1 btn btn-outline border-slate-200 hover:bg-slate-50 text-center flex items-center justify-center gap-2"
                                                    >
                                                        <span>📞</span> Call User
                                                    </a>
                                                    <button
                                                        onClick={() => handleBookingAction(job.id, 'complete')}
                                                        className="flex-1 btn bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                    >
                                                        Complete Job
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="card p-12 bg-white text-center border-dashed">
                                        <div className="text-4xl mb-4">💤</div>
                                        <h3 className="font-bold text-slate-900">No active jobs</h3>
                                        <p className="text-slate-500">Go online to receive new requests.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <div className="card bg-white overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Service</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {completedJobs.map(job => (
                                            <tr key={job.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{job.serviceType}</td>
                                                <td className="px-6 py-4">{job.userName}</td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {job.completedAt ? new Date(job.completedAt.seconds * 1000).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">$45.00</td>
                                                <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                                            </tr>
                                        ))}
                                        {completedJobs.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No completed jobs yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
