import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Utensils, BedDouble } from 'lucide-react';

interface ReportData {
    bookingTrends: { day: string; count: number }[];
    popularFood: { name: string; count: number }[];
    roomStats: { roomNumber: string; type: string; bookings: number }[];
}

const ReportsPage = () => {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/dashboard/reports', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch reports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading insights...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load reports.</div>;

    // Find max values for scaling charts
    const maxBooking = Math.max(...data.bookingTrends.map(d => d.count), 1);
    const maxFood = Math.max(...data.popularFood.map(d => d.count), 1);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Busiest Day"
                    value={data.bookingTrends.reduce((a, b) => a.count > b.count ? a : b).day}
                    icon={<TrendingUp className="text-blue-500" />}
                />
                <StatCard
                    title="Top Dish"
                    value={data.popularFood[0]?.name || 'N/A'}
                    icon={<Utensils className="text-orange-500" />}
                />
                <StatCard
                    title="Most Booked Room"
                    value={data.roomStats[0]?.roomNumber || 'N/A'}
                    icon={<BedDouble className="text-purple-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Trends Chart */}
                <ChartCard title="Weekly Booking Trends">
                    <div className="h-64 flex items-end justify-between gap-2 pt-4">
                        {data.bookingTrends.map((item, index) => (
                            <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="relative w-full flex-1 flex flex-col justify-end items-center">
                                    <div className="mb-2 opacity-0 group-hover:opacity-100 transition text-xs font-medium text-gray-600">
                                        {item.count}
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.count / maxBooking) * 100}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                        className="w-full max-w-[40px] bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                                    />
                                </div>
                                <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                                    {item.day.slice(0, 3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Popular Food Items */}
                <ChartCard title="Top Selling Menu Items">
                    <div className="space-y-4">
                        {data.popularFood.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    <span className="text-gray-500">{item.count} orders</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / maxFood) * 100}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                        className="h-full bg-orange-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Room Stats */}
            <ChartCard title="Room Performance">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm text-gray-400 border-b border-gray-100">
                                <th className="py-2 font-normal">Room No.</th>
                                <th className="py-2 font-normal">Type</th>
                                <th className="py-2 font-normal text-right">Total Bookings</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {data.roomStats.map((room, index) => (
                                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                    <td className="py-3 font-medium text-gray-800">{room.roomNumber}</td>
                                    <td className="py-3 text-gray-500">{room.type}</td>
                                    <td className="py-3 text-right font-medium text-blue-600">{room.bookings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
        {children}
    </div>
);

export default ReportsPage;
