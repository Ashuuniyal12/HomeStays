import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search, User, Phone, FileText, Calendar, X, MapPin } from 'lucide-react';
import Loader from '../../../utils/Loader';

const GuestManager = () => {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGuests, setTotalGuests] = useState(0);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchGuests(page);
    }, [page]);

    const fetchGuests = async (pageNo: number) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/guests?page=${pageNo}&limit=15`);
            setGuests(res.data.guests);
            setTotalPages(res.data.totalPages);
            setTotalGuests(res.data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = async (id: string) => {
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await axios.get(`/api/guests/${id}`);
            setSelectedGuest(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGuest(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="text-blue-500" />
                        Guest Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Total Guests: {totalGuests}</p>
                </div>
                {/* Search could be added here later */}
            </div>

            {/* Guest Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                {/* Mobile: Stacked Card View */}
                <div className="block md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center"><Loader size={32} className="mx-auto text-blue-500" /></div>
                    ) : guests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No guests found.</div>
                    ) : (
                        guests.map((guest) => {
                            const visitCount = guest.bookings?.length || 0;
                            let tier = 'Normal';
                            let tierColors = 'bg-green-50 text-green-700 border-green-200';
                            if (visitCount >= 10) { tier = 'Diamond'; tierColors = 'bg-indigo-50 text-indigo-700 border-indigo-200'; }
                            else if (visitCount >= 7) { tier = 'Gold'; tierColors = 'bg-amber-50 text-amber-700 border-amber-200'; }
                            else if (visitCount >= 3) { tier = 'Silver'; tierColors = 'bg-gray-100 text-gray-700 border-gray-200'; }

                            return (
                                <div
                                    key={guest.id}
                                    onClick={() => handleRowClick(guest.id)}
                                    className="p-4 bg-white active:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{guest.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono">@{guest.username}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${tierColors}`}>
                                            {tier}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{guest.phoneNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText size={14} className="text-gray-400" />
                                            <span>{guest.idType}: {guest.idNumber || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-dashed border-gray-100">
                                        <Calendar size={12} />
                                        Last Visit: {guest.bookings?.[0] ? new Date(guest.bookings[0].checkIn).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="p-4">Name</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">ID Details</th>
                                <th className="p-4">Last Visit</th>
                                <th className="p-4 text-center">Tier</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><Loader size={32} className="mx-auto text-blue-500" /></td></tr>
                            ) : guests.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No guests found.</td></tr>
                            ) : (
                                guests.map((guest) => {
                                    const visitCount = guest.bookings?.length || 0;
                                    let tier = 'Normal';
                                    let tierColors = 'bg-green-50 text-green-700 border-green-200';
                                    if (visitCount >= 10) { tier = 'Diamond'; tierColors = 'bg-indigo-50 text-indigo-700 border-indigo-200'; }
                                    else if (visitCount >= 7) { tier = 'Gold'; tierColors = 'bg-amber-50 text-amber-700 border-amber-200'; }
                                    else if (visitCount >= 3) { tier = 'Silver'; tierColors = 'bg-gray-100 text-gray-700 border-gray-200'; }

                                    return (
                                        <tr
                                            key={guest.id}
                                            onClick={() => handleRowClick(guest.id)}
                                            className="hover:bg-blue-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs group-hover:bg-white">
                                                        {guest.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900 group-hover:text-blue-700">{guest.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{guest.username}</td>
                                            <td className="p-4 text-gray-600 text-sm">{guest.phoneNumber || '--'}</td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {guest.idType ? `${guest.idType}: ${guest.idNumber}` : '--'}
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {guest.bookings?.[0] ? new Date(guest.bookings[0].checkIn).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${tierColors}`}>
                                                    {tier}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 group-hover:text-blue-500">
                                                <ChevronRight size={16} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Grid */}
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-1 bg-white border rounded-full shadow-sm text-sm font-medium text-gray-600">
                    Page {page} of {totalPages}
                </div>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Guest Details Modal */}
            {isModalOpen && (
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
                            {modalLoading || !selectedGuest ? (
                                <div className="flex justify-center py-12">
                                    <Loader size={48} className="text-blue-500" />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Profile Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                            <h4 className="text-sm font-bold text-blue-800 uppercase mb-3">Personal Info</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 text-sm">Full Name</span>
                                                    <span className="font-semibold text-gray-900">{selectedGuest.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 text-sm">Username</span>
                                                    <span className="font-mono text-gray-900">{selectedGuest.username}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 text-sm">Phone</span>
                                                    <span className="font-semibold text-gray-900">{selectedGuest.phoneNumber || '--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Identification</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 text-sm">ID Type</span>
                                                    <span className="font-semibold text-gray-900">{selectedGuest.idType || '--'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 text-sm">ID Number</span>
                                                    <span className="font-mono text-gray-900">{selectedGuest.idNumber || '--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking History */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Calendar size={18} className="text-gray-500" />
                                            Booking History
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                                                    <tr>
                                                        <th className="p-3">Room</th>
                                                        <th className="p-3">Check In</th>
                                                        <th className="p-3">Check Out</th>
                                                        <th className="p-3">Status</th>
                                                        <th className="p-3 text-right">Bill Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {selectedGuest.bookings.map((booking: any) => (
                                                        <tr key={booking.id} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium">Room {booking.room?.number} ({booking.room?.type})</td>
                                                            <td className="p-3">{new Date(booking.checkIn).toLocaleDateString()}</td>
                                                            <td className="p-3">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'Active'}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                                    booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                                                        'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-medium">
                                                                ₹{booking.billAmount || 0}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestManager;
