import React, { useState, useEffect } from 'react';
import axios from 'axios';

import BillView from '../../billing/components/BillView';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

const BookingManager = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [historyBookings, setHistoryBookings] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        roomId: '',
        guestName: '',
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: ''
    });

    // New Guest Creds
    const [newGuestCreds, setNewGuestCreds] = useState<any>(null);

    useEffect(() => {
        fetchData();
        fetchHistory();
    }, []);

    const fetchData = async () => {
        try {
            const [bRes, rRes] = await Promise.all([
                axios.get('/api/bookings/active'),
                axios.get('/api/rooms')
            ]);
            setBookings(bRes.data);
            setRooms(rRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/bookings/history');
            setHistoryBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await axios.post('/api/bookings', formData);
            setNewGuestCreds(res.data.credentials);
            setShowForm(false);
            fetchData();
            // Reset form
            setFormData({ roomId: '', guestName: '', checkInDate: '', expectedCheckOutDate: '' });
        } catch (err) {
            toast.error('Check-in failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckOut = async (id: string) => {
        // Confirm implied by the button "Confirm Payment"
        setIsProcessing(true);
        try {
            await axios.post(`/api/bookings/${id}/checkout`);
            toast.success('Check-out successful');
            setSelectedBookingId(null);
            fetchData();
            fetchHistory();
        } catch (err: any) {
            console.error(err);
            toast.error('Checkout failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            {/* Processing Loader Modal */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={48} className="text-blue-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Processing...</h3>
                        <p className="text-gray-500 text-sm mt-1">Finalizing bill & checkout...</p>
                    </div>
                </div>
            )}

            {/* remainder of file... */}


            {newGuestCreds && (
                <div className="mb-6 bg-green-100 border border-green-400 text-green-700 p-4 rounded relative">
                    <strong className="font-bold">Check-in Successful!</strong>
                    <span className="block sm:inline"> Share these credentials with the guest.</span>
                    <div className="mt-2 bg-white p-2 rounded border">
                        <p>Username: <strong>{newGuestCreds.username}</strong></p>
                        <p>Password: <strong>{newGuestCreds.password}</strong></p>
                    </div>
                    <button className="absolute top-0 right-0 px-4 py-3" onClick={() => setNewGuestCreds(null)}>
                        <span role="button">×</span>
                    </button>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setViewMode('ACTIVE')}
                        className={`text-xl font-bold pb-1 ${viewMode === 'ACTIVE' ? 'border-b-2 border-blue-600 text-gray-800' : 'text-gray-400'}`}
                    >
                        Active Bookings
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`text-xl font-bold pb-1 ${viewMode === 'HISTORY' ? 'border-b-2 border-blue-600 text-gray-800' : 'text-gray-400'}`}
                    >
                        Past Bookings
                    </button>
                </div>

                {viewMode === 'ACTIVE' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Cancel' : 'New Check-in'}
                    </button>
                )}
            </div>

            {showForm && viewMode === 'ACTIVE' && (
                <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-blue-500">
                    <h3 className="font-bold text-lg mb-4">Guest Check-in</h3>
                    <form onSubmit={handleCheckIn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Room</label>
                            <select
                                required
                                className="w-full border p-2 rounded"
                                value={formData.roomId}
                                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                            >
                                <option value="">-- Select Available Room --</option>
                                {rooms.filter(r => r.status === 'AVAILABLE').map(r => (
                                    <option key={r.id} value={r.id}>Room {r.number} ({r.type})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Guest Name</label>
                            <input
                                required
                                type="text"
                                className="w-full border p-2 rounded"
                                value={formData.guestName}
                                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Check-in Date</label>
                            <input
                                required
                                type="date"
                                className="w-full border p-2 rounded"
                                value={formData.checkInDate}
                                onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expected Check-out</label>
                            <input
                                required
                                type="date"
                                className="w-full border p-2 rounded"
                                value={formData.expectedCheckOutDate}
                                onChange={e => setFormData({ ...formData, expectedCheckOutDate: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                                Confirm Check-in
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {viewMode === 'ACTIVE' ? 'Expected Out' : 'Checked Out'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(viewMode === 'ACTIVE' ? bookings : historyBookings).map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                    {booking.room?.number || booking.roomId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {booking.guest?.name}
                                    {viewMode === 'ACTIVE' && (
                                        <>
                                            <div className="text-xs text-gray-500">User: <span className="font-mono text-gray-700">{booking.guest?.username}</span></div>
                                            <div className="text-xs text-gray-500">Pass: <span className="font-mono text-gray-700">{booking.plainPassword || '****'}</span></div>
                                        </>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.checkIn).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(booking.checkOut).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedBookingId(booking.id)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View Bill
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(viewMode === 'ACTIVE' ? bookings : historyBookings).length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        {viewMode === 'ACTIVE' ? 'No active bookings' : 'No past bookings found'}
                    </div>
                )}
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
                            readonly={viewMode === 'HISTORY'}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManager;
