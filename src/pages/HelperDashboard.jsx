import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export default function HelperDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAvailable, setIsAvailable] = useState(userProfile?.status === 'available');
    const [incomingBooking, setIncomingBooking] = useState(null);
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [stats, setStats] = useState({ earnings: 0, jobs: 0, rating: 4.8 });

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

    // Listen for Incoming Requests
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'bookings'),
            where('helperId', '==', currentUser.uid),
            where('status', '==', 'pending_acceptance')
        );
        return onSnapshot(q, (snapshot) => {
            setIncomingBooking(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        });
    }, [currentUser]);

    // Listen for Active Jobs
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'bookings'),
            where('helperId', '==', currentUser.uid),
            where('status', 'in', ['assigned', 'in_progress'])
        );
        return onSnapshot(q, (snapshot) => {
            setActiveJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [currentUser]);

    // Listen for Completed Jobs (for stats)
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'bookings'),
            where('helperId', '==', currentUser.uid),
            where('status', '==', 'completed')
        );
        return onSnapshot(q, (snapshot) => {
            const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompletedJobs(jobs);
            // Simple stat calculation
            setStats(prev => ({ ...prev, jobs: jobs.length, earnings: jobs.length * 45 }));
        });
    }, [currentUser]);

    const handleBookingAction = async (id, action) => {
        if (action === 'accept') await updateDoc(doc(db, 'bookings', id), { status: 'assigned' });
        if (action === 'reject') await updateDoc(doc(db, 'bookings', id), { status: 'searching', helperId: null });
        if (action === 'complete') await updateDoc(doc(db, 'bookings', id), { status: 'completed', completedAt: new Date() });
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
                        {['overview', 'active', 'history', 'earnings'].map(tab => (
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
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">🔔</div>
                                    <div>
                                        <h3 className="text-xl font-bold">New Job Request</h3>
                                        <p className="text-blue-100">{incomingBooking.serviceType} • 5km away</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
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
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="card p-6 bg-white">
                                    <div className="text-slate-500 text-sm font-medium mb-1">Today's Earnings</div>
                                    <div className="text-3xl font-bold text-slate-900">${stats.earnings}</div>
                                </div>
                                <div className="card p-6 bg-white">
                                    <div className="text-slate-500 text-sm font-medium mb-1">Jobs Completed</div>
                                    <div className="text-3xl font-bold text-slate-900">{stats.jobs}</div>
                                </div>
                                <div className="card p-6 bg-white">
                                    <div className="text-slate-500 text-sm font-medium mb-1">Acceptance Rate</div>
                                    <div className="text-3xl font-bold text-slate-900">92%</div>
                                </div>
                            </div>

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
                                                        <p className="text-slate-500 text-sm">Customer: {job.userName}</p>
                                                    </div>
                                                    <StatusBadge status={job.status} />
                                                </div>
                                                <div className="h-48 bg-slate-100 rounded-lg mb-4 overflow-hidden border border-slate-200">
                                                    <LiveMap bookings={[job]} role="helper" />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button className="flex-1 btn btn-outline border-slate-200 hover:bg-slate-50">Navigate</button>
                                                    <button className="flex-1 btn btn-outline border-slate-200 hover:bg-slate-50">Call User</button>
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
