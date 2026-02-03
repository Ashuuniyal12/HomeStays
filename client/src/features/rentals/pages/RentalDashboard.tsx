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
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Rentals</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Due Returns</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.due.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Due Returns List */}
            {stats.due.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle size={18} className="text-orange-500" />
                            Overdue / Due Returns
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.due.map((order: any) => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div>
                                    <p className="font-bold text-gray-900">{order.customer?.name}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar size={14} />
                                        Return: {new Date(order.returnDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {order.status}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">
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
