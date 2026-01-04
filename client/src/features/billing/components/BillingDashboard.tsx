import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import BillView from './BillView';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

const BillingDashboard = () => {
    const [stats, setStats] = useState({ weekly: 0, monthly: 0, yearly: 0 });
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [historyBookings, setHistoryBookings] = useState<any[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE'); // For modal logic if needed, mostly just distinct lists
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchEarnings();
        fetchBookings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await axios.get('/api/bookings/earnings');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch earnings");
        }
    };

    const fetchBookings = async () => {
        try {
            const [activeRes, historyRes] = await Promise.all([
                axios.get('/api/bookings/active'),
                axios.get('/api/bookings/history')
            ]);
            setActiveBookings(activeRes.data);
            setHistoryBookings(historyRes.data);
        } catch (err) {
            console.error("Failed to fetch bookings");
        }
    };

    const handleCheckOut = async (id: string) => {
        setIsProcessing(true);
        try {
            await axios.post(`/api/bookings/${id}/checkout`);
            toast.success('Check-out successful');
            setSelectedBookingId(null);
            await Promise.all([fetchEarnings(), fetchBookings()]);
        } catch (err: any) {
            console.error(err);
            toast.error('Checkout failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Loader Modal */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={48} className="text-blue-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Processing...</h3>
                        <p className="text-gray-500 text-sm mt-1">Finalizing bill & checkout...</p>
                    </div>
                </div>
            )}

            {/* Top Section: Earnings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 font-medium mb-1">Weekly Earnings</p>
                            <h3 className="text-3xl font-bold">₹{stats.weekly.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Monthly Revenue</p>
                            <h3 className="text-3xl font-bold">₹{stats.monthly.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 font-medium mb-1">Yearly Income</p>
                            <h3 className="text-3xl font-bold">₹{stats.yearly.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Active Bills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <CreditCard className="text-blue-500" size={20} />
                        Active Guest Bills
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        Room {booking.room?.number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {booking.guest?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                        {new Date(booking.checkIn).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => { setSelectedBookingId(booking.id); setViewMode('ACTIVE'); }}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Bill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeBookings.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No active bookings at the moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Section: Settled Bills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Calendar className="text-gray-500" size={20} />
                        Settled Bills History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked Out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bill</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {historyBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        Room {booking.room?.number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {booking.guest?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                        {new Date(booking.checkOut).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                                        ₹{booking.billAmount ? booking.billAmount.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => { setSelectedBookingId(booking.id); setViewMode('HISTORY'); }}
                                            className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {historyBookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No settled bills found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bill Modal */}
            {selectedBookingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setSelectedBookingId(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <BillView
                            bookingId={selectedBookingId}
                            isAdmin={true}
                            readonly={viewMode === 'HISTORY'}
                            onCheckout={() => handleCheckOut(selectedBookingId)}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
export default BillingDashboard;
