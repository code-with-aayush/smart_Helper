import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SERVICE_TYPES } from '../utils/seedData';

const AVAILABLE_SKILLS = SERVICE_TYPES.map(s => s.id);

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (role === 'helper' && selectedSkills.length === 0) {
            setError('Please select at least one skill');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, name, role, selectedSkills);
            navigate(role === 'helper' ? '/helper' : '/dashboard');
        } catch (err) {
            setError('Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="card w-full max-w-lg p-8 bg-white shadow-lg animate-in">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500 mt-1">Join the professional network</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-base"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-base"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-base"
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">I want to</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('user')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                    ${role === 'user'
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className="text-xl">👤</span>
                                <span className="font-bold text-sm">Book Help</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole('helper')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                    ${role === 'helper'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className="text-xl">🛠️</span>
                                <span className="font-bold text-sm">Offer Help</span>
                            </button>
                        </div>
                    </div>

                    {/* Skills (Helper only) */}
                    {role === 'helper' && (
                        <div className="animate-in pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SKILLS.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                                            ${selectedSkills.includes(skill)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3 text-base shadow-lg shadow-blue-500/20 mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
