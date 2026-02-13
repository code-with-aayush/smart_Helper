import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', role: 'user' },
        { path: '/helper', label: 'Helper Console', role: 'helper' },
        { path: '/admin', label: 'Admin', role: 'admin' }
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">SmartHelper</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {currentUser ? (
                            <>
                                <div className="hidden md:flex items-center gap-6">
                                    {navLinks.map((link) => (
                                        userProfile?.role === link.role && (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className={`text-sm font-medium ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                                            >
                                                {link.label}
                                            </Link>
                                        )
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-bold text-slate-900">{userProfile?.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">{userProfile?.role}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-slate-500 hover:text-red-600 font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
                                <Link to="/register" className="btn btn-primary text-sm py-2">Get Started</Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
