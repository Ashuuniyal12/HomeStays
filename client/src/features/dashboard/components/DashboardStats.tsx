
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CheckCircle,
    Bed,
    Users,
    Utensils,
    CalendarCheck,
    CalendarX,
    DollarSign,
    TrendingUp,
    Plus,
    Clock,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import HallAvailabilityCalendar from '../../hall/components/HallAvailabilityCalendar';
import RoomBookingCalendar from '../../bookings/components/RoomBookingCalendar';
import { useAuth } from '../../auth/auth.store';
import { motion } from 'framer-motion';

interface Stats {
    rooms: {
        total: number;
        available: number;
        occupied: number;
        booked: number;
    };
    bookings: {
        checkIns: number;
        checkOuts: number;
    };
    orders: {
        pending: number;
        deliveredToday: number;
    };
    revenue: {
        today: number;
    };
    hall: {
        todayEvents: number;
        upcomingEvents: number;
    };
}

interface DashboardStatsProps {
    navigate: (tab: string) => void;
}

const DashboardStats = ({ navigate }: DashboardStatsProps) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
                    <p className="text-red-600 font-semibold">Failed to load dashboard statistics</p>
                    <p className="text-red-500 text-sm mt-1">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const QuickAction = ({ icon, label, desc, onClick, color }: any) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group w-full`}
        >
            <div className={`p-3 rounded-lg ${color} text-white mr-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-800">{label}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <ArrowRight className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" size={18} />
        </motion.button>
    );

    const StatCard = ({ icon, label, value, subLabel, colorClass, iconColor, onClick }: any) => (
        <motion.div
            whileHover={{ y: -4 }}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${iconColor}`}>
                {React.cloneElement(icon, { size: 64 })}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
                    {React.cloneElement(icon, { className: iconColor, size: 24 })}
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    {subLabel && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">{subLabel}</p>}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                        <Clock size={16} />
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {getGreeting()}, <span className="text-blue-600">{user?.name}</span>
                    </h1>
                    <p className="text-gray-500">Here's your daily overview for Laxmi Jawahar Homestay.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                        <DollarSign size={16} />
                        Revenue Today: ₹{stats.revenue.today.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction
                        icon={<Plus size={20} />}
                        label="New Booking"
                        desc="Create a reservation"
                        onClick={() => navigate('bookings')}
                        color="bg-blue-600"
                    />
                    <QuickAction
                        icon={<CheckCircle size={20} />}
                        label="Check In"
                        desc="Arriving guests"
                        onClick={() => navigate('bookings')}
                        color="bg-teal-500"
                    />
                    <QuickAction
                        icon={<Utensils size={20} />}
                        label="Kitchen"
                        desc="View active orders"
                        onClick={() => navigate('kitchen')}
                        color="bg-orange-500"
                    />
                    <QuickAction
                        icon={<Users size={20} />}
                        label="Guests"
                        desc="Manage content"
                        onClick={() => navigate('guests')}
                        color="bg-purple-500"
                    />
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Available Rooms - Key Metric */}
                <StatCard
                    icon={<Bed />}
                    label="Available Rooms"
                    value={stats.rooms.available}
                    subLabel={`${stats.rooms.occupied} occupied / ${stats.rooms.total} total`}
                    colorClass="bg-emerald-50"
                    iconColor="text-emerald-600"
                    onClick={() => navigate('rooms')}
                />

                {/* Check-ins */}
                <StatCard
                    icon={<CalendarCheck />}
                    label="Check-ins Today"
                    value={stats.bookings.checkIns}
                    subLabel="Expected arrivals"
                    colorClass="bg-blue-50"
                    iconColor="text-blue-600"
                    onClick={() => navigate('bookings')}
                />

                {/* Check-outs */}
                <StatCard
                    icon={<CalendarX />}
                    label="Check-outs Today"
                    value={stats.bookings.checkOuts}
                    subLabel="Expected departures"
                    colorClass="bg-indigo-50"
                    iconColor="text-indigo-600"
                    onClick={() => navigate('bookings')}
                />

                {/* Pending Orders */}
                <StatCard
                    icon={<Utensils />}
                    label="Pending Orders"
                    value={stats.orders.pending}
                    subLabel={`${stats.orders.deliveredToday} delivered today`}
                    colorClass="bg-orange-50"
                    iconColor="text-orange-600"
                    onClick={() => navigate('kitchen')}
                />
            </div>

            {/* Availability Overview Section - Two Calendars */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CalendarCheck className="text-blue-600" />
                    Availability Overview
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Party Hall Calendar */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <HallAvailabilityCalendar />
                    </div>

                    {/* Room Booking Calendar */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <RoomBookingCalendar />
                    </div>
                </div>
            </div>

            {/* Secondary Info / Revenue Card for Mobile */}
            <div className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Today's Revenue</p>
                        <h2 className="text-3xl font-bold mt-1">₹{stats.revenue.today.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
