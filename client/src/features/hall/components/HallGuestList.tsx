import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, User, Phone, FileText, Calendar, X, MapPin } from 'lucide-react';
import Loader from '../../../utils/Loader';

const HallGuestList = () => {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // Simple pagination if backend doesn't support it yet, we can slice locally or just show all for now. 
    // The implementation plan mentioned simple pagination support. Let's assume client-side pagination for now if API returns all.
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/hall/guests');
            setGuests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (guest: any) => {
        setSelectedGuest(guest);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGuest(null);
    };

    // Client-side pagination
    const totalPages = Math.ceil(guests.length / ITEMS_PER_PAGE);
    const paginatedGuests = guests.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="text-blue-500" />
                        Hall Guests
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Total Guests: {guests.length}</p>
                </div>
            </div>

            {/* Guest Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="p-4">Name</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Address</th>
                                <th className="p-4 text-center">Bookings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <Loader size={32} className="mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : guests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No hall guests found.</td>
                                </tr>
                            ) : (
                                paginatedGuests.map((guest) => (
                                    <tr
                                        key={guest.id}
                                        onClick={() => handleRowClick(guest)}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 font-medium text-gray-900 group-hover:text-blue-700">{guest.name}</td>
                                        <td className="p-4 text-gray-600">
                                            {guest.phoneNumber ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {guest.phoneNumber}
                                                </div>
                                            ) : <span className="text-gray-400 italic">--</span>}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {guest.email ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs truncate max-w-[150px]">{guest.email}</span>
                                                </div>
                                            ) : <span className="text-gray-400 italic">--</span>}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm truncate max-w-[200px]">
                                            {guest.address || <span className="text-gray-400 italic">--</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                                {guest.bookings?.length || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-4 py-2 bg-white border rounded-md text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Guest Details Modal */}
            {isModalOpen && selectedGuest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <User className="text-blue-600" />
                                Guest Details
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-8">
                                {/* Profile Section */}
                                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-800 uppercase mb-3">Contact Info</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500 text-sm block">Full Name</span>
                                            <span className="font-semibold text-gray-900">{selectedGuest.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm block">Phone Number</span>
                                            <span className="font-mono text-gray-900">{selectedGuest.phoneNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-sm block">Email</span>
                                            <span className="text-gray-900">{selectedGuest.email || '--'}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-gray-500 text-sm block">Address</span>
                                            <span className="text-gray-900">{selectedGuest.address || '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking History */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Calendar size={18} className="text-gray-500" />
                                        Hall Booking History
                                    </h4>
                                    {selectedGuest.bookings && selectedGuest.bookings.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                                                    <tr>
                                                        <th className="p-3">Event Date</th>
                                                        <th className="p-3">Session</th>
                                                        <th className="p-3">Purpose</th>
                                                        <th className="p-3">Status</th>
                                                        <th className="p-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {selectedGuest.bookings.map((booking: any) => (
                                                        <tr key={booking.id} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium">
                                                                {new Date(booking.eventDate).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                                    {booking.session}
                                                                </span>
                                                            </td>
                                                            <td className="p-3">{booking.purpose}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                                    booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-medium">
                                                                ₹{booking.totalAmount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            No booking history found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallGuestList;
