import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query param for active state
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'book';

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">SmartHelper</span>
                        </Link>

                        {/* User Specific Nav Links (Moved from Sidebar) */}
                        {currentUser && userProfile?.role === 'user' && (
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/dashboard?tab=book"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'book' && location.pathname === '/dashboard' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                >
                                    Book Service
                                </Link>
                                <Link
                                    to="/dashboard?tab=history"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'history' ? 'bg-slate-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                >
                                    My Activity
                                </Link>
                            </div>
                        )}

                        {/* Admin Links */}
                        {currentUser && userProfile?.role === 'admin' && (
                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-slate-900 bg-slate-100">Overview</Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {currentUser ? (
                            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-slate-900">{userProfile?.name}</div>
                                    <div className="text-xs text-slate-500 capitalize">{userProfile?.role}</div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Login</Link>
                                <Link to="/register" className="btn btn-primary text-sm py-2">Get Started</Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
