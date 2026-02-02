import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillView from '../../billing/components/BillView';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';
import { User, Calendar, LogIn, LogOut, CreditCard, X, Plus, UserCheck, Utensils, Edit2 } from 'lucide-react';
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
    const [isEditing, setIsEditing] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        roomId: '',
        guestName: '',
        phoneNumber: '',
        email: '',
        idType: 'Aadhaar',
        idNumber: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkInTime: '12:00',
        expectedCheckOutDate: '',
        checkOutTime: '11:00',
        advancePayment: '',
        discount: ''
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

    const handleEditBooking = (booking: any) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);

        // Helper to get HH:MM format
        const getTimeString = (date: Date) => {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        setFormData({
            guestName: booking.guest?.name || booking.guestName || '',
            phoneNumber: booking.guest?.phoneNumber || '',
            email: booking.guest?.email || '',
            idType: booking.guest?.idType || 'Aadhaar',
            idNumber: booking.guest?.idNumber || '',
            roomId: booking.roomId?.toString() || '',
            checkInDate: checkIn.toISOString().split('T')[0],
            checkInTime: getTimeString(checkIn),
            expectedCheckOutDate: checkOut.toISOString().split('T')[0],
            checkOutTime: getTimeString(checkOut),
            advancePayment: booking.paidAmount?.toString() || '',
            discount: booking.discount?.toString() || ''
        });
        setEditingBookingId(booking.id);
        setIsEditing(true);
        setShowForm(true);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateCheckIn(formData);
        if (error) {
            toast.error(error);
            return;
        }

        // Combine Date and Time
        const checkInDateTime = new Date(`${formData.checkInDate}T${formData.checkInTime}`);
        const checkOutDateTime = new Date(`${formData.expectedCheckOutDate}T${formData.checkOutTime}`);

        // Payload
        const payload = {
            ...formData,
            checkInDate: checkInDateTime.toISOString(),
            expectedCheckOutDate: checkOutDateTime.toISOString()
        };

        setIsProcessing(true);
        try {
            if (isEditing && editingBookingId) {
                // Update Booking
                await axios.put(`/api/bookings/${editingBookingId}`, payload);
                toast.success('Booking updated successfully');
            } else {
                // Create New Booking
                const res = await axios.post('/api/bookings', payload);
                setNewGuestCreds(res.data.credentials);
                toast.success('Check-in completed successfully!');
            }

            setShowForm(false);
            setIsEditing(false);
            setEditingBookingId(null);
            fetchData();
            // Reset form
            setFormData({
                roomId: '',
                guestName: '',
                phoneNumber: '',
                email: '',
                idType: 'Aadhaar',
                idNumber: '',
                checkInDate: new Date().toISOString().split('T')[0],
                checkInTime: '12:00',
                expectedCheckOutDate: '',
                checkOutTime: '11:00',
                advancePayment: '',
                discount: ''
            });
            setFoundGuest(null);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Operation failed');
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
                        onClick={() => {
                            setShowForm(!showForm);
                            setIsEditing(false);
                            setEditingBookingId(null);
                            setFormData({
                                guestName: '', phoneNumber: '', email: '', idType: 'Aadhaar', idNumber: '',
                                roomId: '', checkInDate: new Date().toISOString().split('T')[0],
                                checkInTime: '12:00',
                                expectedCheckOutDate: '',
                                checkOutTime: '11:00',
                                advancePayment: '', discount: ''
                            });
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : (isEditing ? 'Edit Booking' : 'New Check-in')}
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
                        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                            {isEditing ? <Edit2 size={20} className="text-blue-600" /> : <UserCheck size={20} className="text-green-600" />}
                            {isEditing ? 'Edit Booking Details' : 'Guest Check-in Form'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Room <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    value={formData.roomId}
                                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                >
                                    <option value="">-- Select Room --</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.number} ({r.type})
                                        </option>
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

                            <div className="grid grid-cols-2 gap-4">
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
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Check-in Time</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        value={(formData as any).checkInTime}
                                        onChange={e => setFormData({ ...formData, checkInTime: e.target.value } as any)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Check-out Time</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        value={(formData as any).checkOutTime}
                                        onChange={e => setFormData({ ...formData, checkOutTime: e.target.value } as any)}
                                    />
                                </div>
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
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all transform active:scale-95 shadow-lg shadow-blue-200">
                                {isEditing ? 'Update Booking' : 'Confirm Check-in'}
                            </button>
                        </div>
                    </form>
                </div >
            )}

            {/* Bookings List */}
            {/* Bookings List */}
            <div className="grid gap-4">
                {(viewMode === 'ACTIVE' ? bookings : historyBookings).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="inline-flex bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                            <Calendar size={48} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {viewMode === 'ACTIVE' ? 'No Active Bookings' : 'No Booking History'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {viewMode === 'ACTIVE'
                                ? 'New guests will appear here once checked in.'
                                : 'Past bookings will be archived here.'}
                        </p>
                    </div>
                ) : (
                    (viewMode === 'ACTIVE' ? bookings : historyBookings).map(booking => (
                        <div
                            key={booking.id}
                            className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${viewMode === 'ACTIVE'
                                ? 'border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200'
                                : 'border-gray-100 opacity-90 hover:opacity-100'
                                }`}
                        >
                            {/* Status Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${viewMode === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-300'
                                }`} />

                            <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                                <div className="flex flex-col lg:flex-row gap-6 lg:items-center">

                                    {/* 1. Room Badge & Main Info */}
                                    <div className="flex-shrink-0 flex items-start lg:items-center gap-4 min-w-[180px]">
                                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${viewMode === 'ACTIVE'
                                            ? 'bg-blue-50 border-blue-100 text-blue-700'
                                            : 'bg-gray-50 border-gray-100 text-gray-500'
                                            }`}>
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Room</span>
                                            <span className="text-xl font-bold">{booking.room?.number || booking.roomId}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${viewMode === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {booking.room?.type}
                                                </span>
                                                {viewMode === 'ACTIVE' && booking.discount > 0 && (
                                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm font-bold">
                                                        DISCOUNT
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">₹{booking.room?.price}/night</p>
                                        </div>
                                    </div>

                                    {/* 2. Guest Details */}
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <User size={18} className="text-gray-400" />
                                            <span className="font-bold text-gray-900 text-lg">{booking.guest?.name}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs bg-gray-100 px-1.5 rounded text-gray-600">
                                                    {booking.guest?.username || 'user'}
                                                </span>
                                            </span>
                                            {viewMode === 'ACTIVE' && (
                                                <span className="flex items-center gap-1.5">
                                                    Pass: <span className="font-mono text-xs bg-gray-100 px-1.5 rounded text-gray-600">
                                                        {booking.plainPassword || '****'}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Dates & Timing */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:gap-2 xl:gap-8 min-w-[240px]">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-green-600 bg-green-50 p-1.5 rounded-md">
                                                <LogIn size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Check-in</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(booking.checkIn).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {new Date(booking.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 text-orange-600 bg-orange-50 p-1.5 rounded-md">
                                                <LogOut size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                                    {viewMode === 'ACTIVE' ? 'Expected Out' : 'Checked Out'}
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(booking.checkOut).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {new Date(booking.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Actions */}
                                    <div className="flex lg:flex-col xl:flex-row items-stretch gap-2 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-dashed">
                                        {viewMode === 'ACTIVE' ? (
                                            <>
                                                <button
                                                    onClick={() => setSelectedBookingForOrder(booking)}
                                                    className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                                >
                                                    <Utensils size={16} />
                                                    Order
                                                </button>

                                                <button
                                                    onClick={() => handleEditBooking(booking)}
                                                    className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => setSelectedBookingId(booking.id)}
                                                    className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                                >
                                                    <CreditCard size={16} />
                                                    View Bill
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedBookingId(booking.id)}
                                                className="w-full lg:w-32 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                            >
                                                <CreditCard size={16} />
                                                View Bill
                                            </button>
                                        )}
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
