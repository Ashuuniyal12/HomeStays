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
        email: '', // New Field
        idType: 'Aadhar',
        idNumber: '',
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: '',
        advancePayment: '',
        discount: '' // New Field
    });

    // Guest Lookup State
    const [foundGuest, setFoundGuest] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

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

    const validateCheckIn = (data: any) => {
        if (!data.roomId) return "Please select a room";
        if (!data.guestName?.trim()) return "Guest Name is required";
        if (!data.phoneNumber) return "Phone Number is required";
        if (data.phoneNumber.replace(/\D/g, '').length < 10) return "Phone number must be at least 10 digits";
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid email format";
        if (!data.idType) return "ID Type is required";
        if (!data.idNumber?.trim()) return "ID Number is required";

        if (!data.checkInDate) return "Check-in Date is required";
        if (!data.expectedCheckOutDate) return "Expected Check-out Date is required";

        const checkIn = new Date(data.checkInDate);
        const checkOut = new Date(data.expectedCheckOutDate);
        if (checkOut <= checkIn) return "Check-out date must be after check-in date";

        if (parseFloat(data.advancePayment) < 0) return "Advance payment cannot be negative";
        if (parseFloat(data.discount) < 0) return "Discount cannot be negative";

        return null;
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateCheckIn(formData);
        if (error) {
            toast.error(error);
            return;
        }

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
                email: '',
                idType: 'Aadhar',
                idNumber: '',
                checkInDate: new Date().toISOString().split('T')[0],
                expectedCheckOutDate: '',
                advancePayment: '',
                discount: ''
            });
            setFoundGuest(null);
        } catch (err: any) {
            console.error(err);
            toast.error('Check-in failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const searchGuest = async (query: string) => {
        if (!query || query.length < 3) return;
        setIsSearching(true);
        try {
            const res = await axios.get(`/api/bookings/search-guest?query=${query}`);
            if (res.data) {
                setFoundGuest(res.data);
                // Auto-fill available details if empty
                setFormData(prev => ({
                    ...prev,
                    guestName: prev.guestName || res.data.name || '',
                    phoneNumber: prev.phoneNumber || res.data.phoneNumber || '',
                    email: prev.email || res.data.email || '',
                    idType: prev.idType || res.data.idType || 'Aadhar',
                    idNumber: prev.idNumber || res.data.idNumber || ''
                }));
                toast.success('Guest found!');
            } else {
                setFoundGuest(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                    <button
                        onClick={() => setViewMode('ACTIVE')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${viewMode === 'ACTIVE'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Active
                        {bookings.length > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {bookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${viewMode === 'HISTORY'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        History
                    </button>
                </div>

                {viewMode === 'ACTIVE' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Check-in'}
                    </button>
                )}
            </div>

            {/* Check-in Form */}
            {showForm && viewMode === 'ACTIVE' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-in slide-in-from-top duration-300">
                    <div className="bg-gray-50 border-b px-4 sm:px-5 py-3">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <LogIn size={18} />
                            Guest Check-in
                        </h3>
                    </div>
                    <form onSubmit={handleCheckIn} className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Room <span className="text-red-500">*</span></label>
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
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Guest Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                    placeholder="Enter guest full name"
                                />
                            </div>

                            {/* Email & Phone Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input
                                            required
                                            type="tel"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="Mobile number"
                                            onBlur={(e) => searchGuest(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => searchGuest(formData.phoneNumber)}
                                            className="bg-blue-100 text-blue-600 p-2 rounded-md hover:bg-blue-200 transition"
                                            title="Search Guest History"
                                        >
                                            <UserCheck size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email (Optional)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                            value={(formData as any).email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value } as any)}
                                            placeholder="guest@example.com"
                                            onBlur={(e) => searchGuest(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => searchGuest((formData as any).email)}
                                            className="bg-blue-100 text-blue-600 p-2 rounded-md hover:bg-blue-200 transition"
                                            title="Search Guest History"
                                        >
                                            <UserCheck size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Guest History Banner - Responsive Grid */}
                            {foundGuest && (
                                <div className="col-span-1 md:col-span-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <p className="font-semibold text-blue-800">
                                            Returning Guest: {foundGuest.name}
                                        </p>
                                        {foundGuest.stats && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${foundGuest.stats.tier === 'Diamond' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                                foundGuest.stats.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                    foundGuest.stats.tier === 'Silver' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                        'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {foundGuest.stats.tier} ({foundGuest.stats.totalVisits} visits)
                                            </span>
                                        )}
                                    </div>
                                    {foundGuest.bookings && foundGuest.bookings.length > 0 ? (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-500 font-medium">Last 3 Visits:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {foundGuest.bookings.slice(0, 3).map((b: any) => (
                                                    <div key={b.id} className="text-xs bg-white p-2 rounded border border-blue-100 space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-gray-800">{new Date(b.checkIn).toLocaleDateString()}</span>
                                                            <span className="text-gray-600">Room {b.room?.number} ({b.room?.type})</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-500 border-t border-dashed pt-1 mt-1">
                                                            <span>Rate: ₹{b.room?.price}</span>
                                                            <span className="font-bold text-blue-600">Paid: ₹{b.billAmount}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-blue-600 mt-1">No past bookings found for this account.</p>
                                    )}
                                </div>
                            )}

                            {/* ID Details Group */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ID Type <span className="text-red-500">*</span></label>
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
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ID Number <span className="text-red-500">*</span></label>
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
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Check-in Date <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.checkInDate}
                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected Check-out <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.expectedCheckOutDate}
                                    onChange={e => setFormData({ ...formData, expectedCheckOutDate: e.target.value })}
                                />
                            </div>

                            {/* Payment Section */}
                            <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Discount (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-green-600">-₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full border border-green-200 pl-8 pr-3 py-2 rounded-md text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition bg-green-50/30"
                                            value={(formData as any).discount}
                                            onChange={e => setFormData({ ...formData, discount: e.target.value } as any)}
                                            placeholder="0.00"
                                        />
                                    </div>
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
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        {/* Room Info */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Room</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {booking.room?.number || booking.roomId}
                                            </p>
                                            <p className="text-sm text-gray-500">{booking.room?.type}</p>
                                        </div>

                                        {/* Guest Info */}
                                        <div className="col-span-2 sm:col-span-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Guest</p>
                                            <p className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <User size={18} />
                                                <span className="truncate max-w-[120px]">{booking.guest?.name}</span>
                                            </p>
                                            {viewMode === 'ACTIVE' && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-xs text-gray-500">
                                                        User: <span className="font-mono text-gray-700 font-semibold">{booking.guest?.username}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Check-in Date */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-in</p>
                                            <p className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <LogIn size={18} className="text-green-600 shrink-0" />
                                                {new Date(booking.checkIn).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Check-out Date */}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                                {viewMode === 'ACTIVE' ? 'Expected Out' : 'Checked Out'}
                                            </p>
                                            <p className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <LogOut size={18} className="text-orange-600 shrink-0" />
                                                {new Date(booking.checkOut).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-dashed">
                                        {viewMode === 'ACTIVE' && (
                                            <button
                                                onClick={() => setSelectedBookingForOrder(booking)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-orange-600 border border-orange-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-50 transition-colors"
                                            >
                                                <Utensils size={16} />
                                                Order
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedBookingId(booking.id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-blue-600 border border-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            <CreditCard size={16} />
                                            Bill
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
