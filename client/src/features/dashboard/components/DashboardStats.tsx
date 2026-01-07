
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
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../../auth/auth.store';

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
}

const DashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

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

    const StatCard = ({ icon, label, value, subLabel, colorClass, iconColor, trend }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{value}</h3>
                    {subLabel && <p className="text-xs text-gray-400 mt-2">{subLabel}</p>}
                    {trend && <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> {trend}
                    </p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
                    {React.cloneElement(icon, { className: `${iconColor}` })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || 'Owner'}! 👋</h1>
                <p className="text-blue-100">Here's what's happening at Laxmi Jawahar Homestay today</p>
            </div>

            {/* Revenue Highlight */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Today's Revenue</p>
                        <h2 className="text-4xl font-bold mt-2">₹{stats.revenue.today.toLocaleString()}</h2>
                        <p className="text-emerald-100 text-sm mt-2">Completed bookings and orders</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-xl">
                        <DollarSign size={40} />
                    </div>
                </div>
            </div>

            {/* Rooms Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-blue-600 rounded"></div>
                    <h2 className="text-xl font-bold text-gray-800">Room Status</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<Bed size={28} />}
                        label="Total Rooms"
                        value={stats.rooms.total}
                        colorClass="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={<CheckCircle size={28} />}
                        label="Available"
                        value={stats.rooms.available}
                        colorClass="bg-green-50"
                        iconColor="text-green-600"
                    />
                    <StatCard
                        icon={<Users size={28} />}
                        label="Occupied"
                        value={stats.rooms.occupied}
                        subLabel="Currently in use"
                        colorClass="bg-purple-50"
                        iconColor="text-purple-600"
                    />
                </div>
            </section>

            {/* Booking Activity */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-teal-600 rounded"></div>
                    <h2 className="text-xl font-bold text-gray-800">Today's Activity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        icon={<CalendarCheck size={28} />}
                        label="Check-Ins"
                        value={stats.bookings.checkIns}
                        subLabel="Guests arriving today"
                        colorClass="bg-teal-50"
                        iconColor="text-teal-600"
                    />
                    <StatCard
                        icon={<CalendarX size={28} />}
                        label="Check-Outs"
                        value={stats.bookings.checkOuts}
                        subLabel="Guests departing today"
                        colorClass="bg-orange-50"
                        iconColor="text-orange-600"
                    />
                </div>
            </section>

            {/* Kitchen & Orders */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-red-600 rounded"></div>
                    <h2 className="text-xl font-bold text-gray-800">Kitchen & Orders</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        icon={<Utensils size={28} />}
                        label="Pending Orders"
                        value={stats.orders.pending}
                        subLabel="Awaiting preparation"
                        colorClass="bg-red-50"
                        iconColor="text-red-600"
                    />
                    <StatCard
                        icon={<CheckCircle size={28} />}
                        label="Delivered Today"
                        value={stats.orders.deliveredToday}
                        subLabel="Successfully completed"
                        colorClass="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />
                </div>
            </section>
        </div>
    );
};

export default DashboardStats;
