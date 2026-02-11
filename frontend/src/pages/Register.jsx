import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Toast from '../components/Toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validate = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        try {
            await authService.registerAdmin({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setToastMessage('Account created successfully! Redirecting to login...');
            setToastType('success');
            setShowToast(true);

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            setToastMessage(msg);
            setToastType('error');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden font-sans">
            {/* Animated Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-green/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="glass-card w-full max-w-lg p-8 md:p-10 relative z-10 animate-fade-in-up border-t border-white/20 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-neon-purple to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-neon-purple/20">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Create Admin Account
                    </h1>
                    <p className="text-gray-400 text-sm">Join the ecosystem and manage your events</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-neon-error/10 border border-neon-error/20 text-neon-error text-sm rounded-xl flex items-center gap-3 animate-fade-in-down">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field bg-dark-800/50 border-white/10 focus:bg-dark-800 transition-all"
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field bg-dark-800/50 border-white/10 focus:bg-dark-800 transition-all"
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field bg-dark-800/50 border-white/10 focus:bg-dark-800 transition-all"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field bg-dark-800/50 border-white/10 focus:bg-dark-800 transition-all"
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-4 text-lg shadow-lg shadow-neon-purple/25 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-neon-cyan hover:text-neon-green font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            <div className="absolute bottom-6 text-center text-xs text-gray-600 w-full z-10">
                &copy; 2024 QR Check-In System. All rights reserved.
            </div>
        </div>
    );
};

export default Register;
