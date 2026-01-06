import React, { useState } from 'react';
import { useAuth } from '../auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await login(username, password);
        if (res.success && res.user) {
            if (res.user.role === 'OWNER') {
                navigate('/admin');
            } else if (res.user.role === 'GUEST') {
                navigate('/guest');
            } else {
                navigate('/');
            }
        } else {
            setError(res.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="bg-white/95 backdrop-blur-md p-10 shadow-2xl rounded-sm border-t-4 border-[#D4AF37]">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <h1 className="font-serif text-3xl font-bold text-[#2D2D2D] tracking-wiider uppercase mb-2">Laxmi Jawahar</h1>
                            <span className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase">Homestay</span>
                        </Link>
                    </div>

                    <h2 className="text-center font-serif text-xl italic text-[#555] mb-8">Welcome Back</h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F9F7F2] border border-gray-200 focus:border-[#D4AF37] outline-none transition-colors text-[#2D2D2D]"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F9F7F2] border border-gray-200 focus:border-[#D4AF37] outline-none transition-colors text-[#2D2D2D]"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#2D2D2D] text-white text-sm tracking-widest uppercase hover:bg-[#D4AF37] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">
                            ← Return to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
