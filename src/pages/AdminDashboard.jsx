import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { seedHelpers } from '../utils/seedData';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        availableHelpers: 0,
        revenue: 0
    });
    const [helpers, setHelpers] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Bookings
        const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(docs);

            const active = docs.filter(b => ['searching', 'assigned', 'in_progress'].includes(b.status));
            const completed = docs.filter(b => b.status === 'completed');

            setStats(prev => ({
                ...prev,
                totalBookings: docs.length,
                activeBookings: active.length,
                revenue: completed.length * 15 // Assuming $15 cut
            }));
        });

        // Helpers
        const unsubHelpers = onSnapshot(collection(db, 'helpers'), (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHelpers(docs);
            setStats(prev => ({
                ...prev,
                availableHelpers: docs.filter(h => h.status === 'available').length
            }));
        });

        return () => { unsubBookings(); unsubHelpers(); };
    }, []);

    return (
        <div className="pt-20 pb-10 min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
                        <p className="text-slate-500 text-sm">Monitor system performance and dispatching.</p>
                    </div>
                    <button onClick={seedHelpers} className="btn btn-primary text-sm shadow-md">
                        ⚡ Reset / Seed Data
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', value: `$${stats.revenue}`, color: 'text-green-600' },
                        { label: 'Total Bookings', value: stats.totalBookings, color: 'text-slate-900' },
                        { label: 'Active Requests', value: stats.activeBookings, color: 'text-blue-600' },
                        { label: 'Online Helpers', value: stats.availableHelpers, color: 'text-purple-600' }
                    ].map((stat, i) => (
                        <div key={i} className="card p-6 bg-white border border-slate-200">
                            <div className="text-sm font-medium text-slate-500 mb-1">{stat.label}</div>
                            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Tables */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                All Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('helpers')}
                                className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'helpers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Helper Fleet
                            </button>
                        </div>

                        {activeTab === 'bookings' && (
                            <div className="card bg-white overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3">ID</th>
                                                <th className="px-6 py-3">Service</th>
                                                <th className="px-6 py-3">Customer</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Assigned To</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {bookings.map(book => (
                                                <tr key={book.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{book.id.slice(0, 6)}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{book.serviceType}</td>
                                                    <td className="px-6 py-4">{book.userName}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={book.status} /></td>
                                                    <td className="px-6 py-4 text-slate-500">{book.helperName || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'helpers' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {helpers.map(helper => (
                                    <div key={helper.id} className="card p-4 bg-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                                {helper.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{helper.name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{helper.skills?.join(', ')}</div>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${helper.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {helper.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Live Overview Map */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="card bg-white p-4 border border-slate-200 shadow-sm mb-4">
                                <h3 className="font-bold text-slate-900 mb-2">Live Fleet Map</h3>
                                <div className="h-[400px] rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                    <LiveMap bookings={bookings} role="admin" />
                                </div>
                            </div>

                            <div className="card bg-slate-900 p-6 text-white text-center">
                                <h3 className="font-bold text-lg mb-1">System Healthy</h3>
                                <p className="text-slate-400 text-sm">All services operational</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
