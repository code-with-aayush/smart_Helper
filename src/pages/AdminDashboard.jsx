import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { seedHelpers, SERVICE_TYPES } from '../utils/seedData';
import LiveMap from '../components/LiveMap';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        availableHelpers: 0,
        avgMatchTime: '3.2s'
    });
    const [helpers, setHelpers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [recentMatches, setRecentMatches] = useState([]);

    useEffect(() => {
        // Bookings Listener
        const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(docs);
            const active = docs.filter(b => ['searching', 'assigned', 'in_progress'].includes(b.status));
            setStats(prev => ({ ...prev, totalBookings: docs.length, activeBookings: active.length }));

            // Fake "Matches" feed from recent bookings
            const matches = docs
                .filter(b => b.status === 'assigned' || b.status === 'completed')
                .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                .slice(0, 5);
            setRecentMatches(matches);
        });

        // Helpers Listener
        const unsubHelpers = onSnapshot(collection(db, 'helpers'), (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHelpers(docs);
            const available = docs.filter(h => h.status === 'available').length;
            setStats(prev => ({ ...prev, availableHelpers: available }));
        });

        return () => { unsubBookings(); unsubHelpers(); };
    }, []);

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 font-sans">

            {/* Full Map Background */}
            <div className="absolute inset-0 z-0">
                <LiveMap bookings={bookings} role="admin" />
            </div>

            {/* Top Header / Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-none">System Dispatch Monitor</h1>
                        <p className="text-xs text-slate-500 font-mono tracking-wider">ENGINE v4.2.0 • LIVE STREAM</p>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold">Avg. Match Time</div>
                        <div className="text-xl font-bold text-blue-600">{stats.avgMatchTime}</div>
                    </div>
                    <div className="text-center border-l border-slate-200 pl-8">
                        <div className="text-xs text-slate-500 uppercase font-bold">Active Requests</div>
                        <div className="text-xl font-bold text-slate-900">{stats.activeBookings}</div>
                    </div>
                    <div className="text-center border-l border-slate-200 pl-8">
                        <div className="text-xs text-slate-500 uppercase font-bold">Online Helpers</div>
                        <div className="text-xl font-bold text-slate-900">{stats.availableHelpers}</div>
                    </div>
                    <button onClick={seedHelpers} className="btn btn-primary ml-4 px-4 py-2 text-sm shadow-lg shadow-blue-500/20">
                        ⚡ Config
                    </button>
                </div>
            </div>

            {/* Right Sidebar: Live Logs */}
            <div className="absolute top-24 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden z-10 animate-fade-in">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 className="font-bold text-slate-800 text-sm">Live Assignment Log</h3>
                    </div>
                    <div className="flex gap-2 text-slate-400">
                        <button className="hover:text-slate-600">⬇</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {recentMatches.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-8">No recent matches</p>
                    )}
                    {recentMatches.map(match => (
                        <div key={match.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono text-slate-400">{match.createdAt?.seconds ? new Date(match.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Matched</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                                <span className="font-bold text-slate-900">Helper {match.helperName?.split(' ')[0]}</span> matched to <span className="font-bold text-slate-900">{match.userName?.split(' ')[0]}</span>
                            </p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <span>📍 1.2km</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <span>🛠️ {match.serviceType}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Fake stream items for visuals if empty */}
                    {recentMatches.length < 3 && (
                        <div className="opacity-50 grayscale">
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-mono text-slate-400">14:20:55</span>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Scanning</span>
                                </div>
                                <p className="text-sm text-slate-500 italic">System re-routing... Match pending</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">SYSTEM EFFICIENCY</span>
                        <span className="font-bold text-green-600">98.4%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 w-[98.4%] rounded-full"></div>
                    </div>
                </div>
            </div>

        </div>
    );
}
