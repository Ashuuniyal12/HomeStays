import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingBag, AlertCircle, Calendar } from 'lucide-react';
import Loader from '../../../utils/Loader';

const RentalDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/rentals/orders/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader /></div>;
    if (!stats) return <div className="text-center p-12 text-gray-500 text-sm">Failed to load statistics.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-xl shadow-inner">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Monthly Revenue</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">₹{stats.revenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl shadow-inner">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Rentals</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.active}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-xl shadow-inner">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Due Returns</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.due.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Due Returns List */}
            {stats.due.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/30">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" />
                            Overdue / Due Returns
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {stats.due.map((order: any) => (
                            <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition gap-4 sm:gap-0">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                                        {order.customer?.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{order.customer?.name}</p>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                Return: <span className="text-orange-600 font-medium">{new Date(order.returnDate).toLocaleDateString()}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                        {order.status}
                                    </span>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {order.customer?.phoneNumber}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalDashboard;
