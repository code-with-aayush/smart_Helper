import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show navbar on dashboard/map pages if we want a "floating" feel (optional, but requested layout implies full screen maps).
    // For now, let's keep a sticky top navbar that is minimal.

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            ⚡
                        </div>
                        <span className="text-xl font-bold text-slate-900 font-heading tracking-tight">SmartHelper</span>
                    </Link>

                    {/* Desktop Nav */}
                    {currentUser && (
                        <div className="hidden md:flex items-center gap-8">
                            {[
                                { path: '/dashboard', label: 'Dashboard', role: 'user' },
                                { path: '/helper', label: 'Jobs', role: 'helper' },
                                { path: '/admin', label: 'Admin', role: 'admin' }
                            ].map((link) => (
                                userProfile?.role === link.role && (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`text-sm font-medium transition-colors relative py-1
                      ${isActive(link.path)
                                                ? 'text-blue-600 font-semibold'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {link.label}
                                        {isActive(link.path) && (
                                            <span className="absolute -bottom-[21px] left-0 w-full h-[2px] bg-blue-600"></span>
                                        )}
                                    </Link>
                                )
                            ))}
                        </div>
                    )}

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 leading-none">{userProfile?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{userProfile?.role}</p>
                                </div>
                                <div className="relative group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                        {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : (userProfile?.name?.[0] || 'U')}
                                    </div>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors font-medium rounded-xl"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn btn-primary text-sm px-5 py-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
