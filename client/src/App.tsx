import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/auth.store'
import LoginPage from './features/auth/pages/LoginPage'
import AdminDashboard from './features/dashboard/pages/AdminDashboard'
import GuestDashboard from './features/dashboard/pages/GuestDashboard'
import LandingPage from './features/landing/pages/LandingPage'
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // Redirect logic based on role
    if (role && user.role !== role) {
        // If trying to access Admin as Guest -> go to Guest
        if (user.role === 'GUEST') return <Navigate to="/guest" />;
        // If trying to access Guest as Owner -> allow? or separate?
        // For now strict:
        return <Navigate to="/" />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-center" />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={
                        <ProtectedRoute role="OWNER">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/guest" element={
                        <ProtectedRoute role="GUEST">
                            <GuestDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
