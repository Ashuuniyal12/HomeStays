import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillView from '../../billing/components/BillView';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';
import { User, Calendar, LogIn, LogOut, CreditCard, X, Plus, UserCheck, Utensils } from 'lucide-react';
import AdminOrderModal from './AdminOrderModal';

const BookingManager = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [historyBookings, setHistoryBookings] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [selectedBookingForOrder, setSelectedBookingForOrder] = useState<any>(null); // New State
    const [viewMode, setViewMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        roomId: '',
        guestName: '',
        phoneNumber: '',
        idType: 'Aadhar',
        idNumber: '',
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: '',
        advancePayment: '' // New Field
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
            toast.success('Check-in completed successfully!');
            // Reset form
            setFormData({
                roomId: '',
                guestName: '',
                phoneNumber: '',
                idType: 'Aadhar',
                idNumber: '',
                checkInDate: new Date().toISOString().split('T')[0],
                expectedCheckOutDate: '',
                advancePayment: ''
            });
        } catch (err: any) {
            console.error(err);
            toast.error('Check-in failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckOut = async (id: string) => {
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
        <div className="space-y-6">
            {/* Processing Loader Modal */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={56} className="text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">Processing...</h3>
                        <p className="text-gray-500 text-sm mt-2">Finalizing bill & checkout...</p>
                    </div>
                </div>
            )}

            {/* Guest Credentials Success Banner */}
            {newGuestCreds && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative animate-in slide-in-from-top duration-300">
                    <button
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition"
                        onClick={() => setNewGuestCreds(null)}
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <UserCheck size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">Check-in Successful! 🎉</h3>
                            <p className="text-green-100 mb-4">Share these credentials with the guest</p>
                            <div className="bg-white rounded-lg p-4 text-gray-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Username</p>
                                        <p className="font-mono font-bold text-lg">{newGuestCreds.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Password</p>
                                        <p className="font-mono font-bold text-lg">{newGuestCreds.password}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Order Modal - New Addition */}
            {selectedBookingForOrder && (
                <AdminOrderModal
                    bookingId={selectedBookingForOrder.id}
                    roomNumber={selectedBookingForOrder.room?.number?.toString() || ''}
                    guestName={selectedBookingForOrder.guest?.name || 'Guest'}
                    onClose={() => setSelectedBookingForOrder(null)}
                />
            )}

            {/* Header with Tabs and New Check-in Button */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('ACTIVE')}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${viewMode === 'ACTIVE'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Active Bookings
                        {bookings.length > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {bookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${viewMode === 'HISTORY'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Past Bookings
                    </button>
                </div>

                {viewMode === 'ACTIVE' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Check-in'}
                    </button>
                )}
            </div>

            {/* Check-in Form */}
            {showForm && viewMode === 'ACTIVE' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-in slide-in-from-top duration-300">
                    <div className="bg-gray-50 border-b px-5 py-3">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <LogIn size={18} />
                            Guest Check-in
                        </h3>
                    </div>
                    <form onSubmit={handleCheckIn} className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Room</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Guest Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                    placeholder="Enter guest full name"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="Mobile number string with country code"
                                />
                            </div>

                            {/* ID Details Group */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ID Type</label>
                                    <select
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        value={formData.idType}
                                        onChange={e => setFormData({ ...formData, idType: e.target.value })}
                                    >
                                        <option value="Aadhar">Aadhar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="Voter ID">Voter ID</option>
                                        <option value="Driving License">Driving License</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ID Number</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        value={formData.idNumber}
                                        onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                                        placeholder="ID Number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Check-in Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.checkInDate}
                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected Check-out</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.expectedCheckOutDate}
                                    onChange={e => setFormData({ ...formData, expectedCheckOutDate: e.target.value })}
                                />
                            </div>

                            {/* Advance Payment */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Advance Payment (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border border-gray-300 pl-7 pr-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        value={(formData as any).advancePayment}
                                        onChange={e => setFormData({ ...formData, advancePayment: e.target.value } as any)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                                Confirm Check-in
                            </button>
                        </div>
                    </form>
                </div >
            )}

            {/* Bookings List */}
            <div className="grid gap-4">
                {(viewMode === 'ACTIVE' ? bookings : historyBookings).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Calendar size={64} className="mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg font-semibold">
                            {viewMode === 'ACTIVE' ? 'No active bookings' : 'No past bookings found'}
                        </p>
                    </div>
                ) : (
                    (viewMode === 'ACTIVE' ? bookings : historyBookings).map(booking => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-shadow duration-200 overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {/* Room Info */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Room</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {booking.room?.number || booking.roomId}
                                            </p>
                                            <p className="text-sm text-gray-500">{booking.room?.type}</p>
                                        </div>

                                        {/* Guest Info */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Guest</p>
                                            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <User size={18} />
                                                {booking.guest?.name}
                                            </p>
                                            {viewMode === 'ACTIVE' && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-xs text-gray-500">
                                                        User: <span className="font-mono text-gray-700 font-semibold">{booking.guest?.username}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Pass: <span className="font-mono text-gray-700 font-semibold">{booking.plainPassword || '****'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Check-in Date */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-in</p>
                                            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <LogIn size={18} className="text-green-600" />
                                                {new Date(booking.checkIn).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        {/* Check-out Date */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                                {viewMode === 'ACTIVE' ? 'Expected Out' : 'Checked Out'}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <LogOut size={18} className="text-orange-600" />
                                                {new Date(booking.checkOut).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {viewMode === 'ACTIVE' && (
                                            <button
                                                onClick={() => setSelectedBookingForOrder(booking)}
                                                className="flex items-center gap-1.5 text-orange-600 border border-orange-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <Utensils size={16} />
                                                Add Order
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedBookingId(booking.id)}
                                            className="flex items-center gap-1.5 text-blue-600 border border-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            <CreditCard size={16} />
                                            View Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bill View Modal */}
            {
                selectedBookingId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setSelectedBookingId(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
                            >
                                <X size={28} />
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
                )
            }
        </div >
    );
};

export default BookingManager;
