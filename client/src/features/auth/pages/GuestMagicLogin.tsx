import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.store';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const GuestMagicLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'ERROR'>('VERIFYING');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyAndLogin = async () => {
            const username = searchParams.get('u');
            const password = searchParams.get('p');

            if (!username || !password) {
                setStatus('ERROR');
                setErrorMessage('Invalid login link.');
                return;
            }

            try {
                // Attempt login
                const res = await login(username, password);

                if (res.success) {
                    setStatus('SUCCESS');
                    // Small delay for user to see success state before redirect
                    setTimeout(() => {
                        navigate('/guest');
                    }, 1500);
                } else {
                    setStatus('ERROR');
                    setErrorMessage('Link is expired or invalid.');
                }
            } catch (err) {
                console.error(err);
                setStatus('ERROR');
                setErrorMessage('Something went wrong. Please try again.');
            }
        };

        verifyAndLogin();
    }, [login, navigate, searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden text-center p-8"
            >
                {status === 'VERIFYING' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <h2 className="text-xl font-bold text-gray-800">Verifying your link...</h2>
                        <p className="text-gray-500">Please wait while we log you in securely.</p>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-gray-500">Login successful. Redirecting to your dashboard...</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Link Expired</h2>
                        <p className="text-gray-500 max-w-[260px] mx-auto">
                            Sorry, this login link is no longer valid or has expired.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {errorMessage}
                        </p>
                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-2">Need help?</p>
                            <button
                                onClick={() => window.open('https://wa.me/91XXXXXXXXXX', '_blank')}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="mt-8 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Laxmi Jawahar Homestay</p>
            </div>
        </div>
    );
};

export default GuestMagicLogin;
