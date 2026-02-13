import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        const redirectPath = userProfile.role === 'helper' ? '/helper' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}
