import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 font-heading">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full shadow-lg shadow-blue-500/20"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
