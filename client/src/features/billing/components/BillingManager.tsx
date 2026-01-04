import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillView from './BillView';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

const BillingManager = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [billSummaries, setBillSummaries] = useState<Record<string, number>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/bookings/active');
            setBookings(res.data);

            // Fetch bill summary for each booking to show "Live Bill"
            // In a real app, this should be a single "dashboard summary" API to avoid N+1 requests
            // But for now we iterate (or we could fetch on demand, but user asked to "see details in it")
            res.data.forEach((b: any) => fetchBillSummary(b.id));

        } catch (err) {
            console.error(err);
        }
    };

    const fetchBillSummary = async (bookingId: string) => {
        try {
            const res = await axios.get(`/api/bookings/${bookingId}/bill`);
            setBillSummaries(prev => ({ ...prev, [bookingId]: res.data.grandTotal }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckOut = async (id: string) => {
        setIsProcessing(true);
        try {
            await axios.post(`/api/bookings/${id}/checkout`);
            toast.success('Payment confirmed & Checked out');
            setSelectedBookingId(null);
            fetchData();
        } catch (err) {
            toast.error('Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Bill</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                    {booking.room?.number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{booking.guest?.name}</div>
                                    <div className="text-xs text-gray-500">{booking.guest?.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.checkIn).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                    {billSummaries[booking.id] !== undefined ? `₹${billSummaries[booking.id].toFixed(2)}` : 'Loading...'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedBookingId(booking.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <div className="p-6 text-center text-gray-500">No active bookings</div>}
            </div>

            {selectedBookingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full relative">
                        <button
                            onClick={() => setSelectedBookingId(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold px-2"
                        >
                            &times;
                        </button>
                        <BillView
                            bookingId={selectedBookingId}
                            isAdmin={true}
                            onCheckout={() => handleCheckOut(selectedBookingId)}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManager;
