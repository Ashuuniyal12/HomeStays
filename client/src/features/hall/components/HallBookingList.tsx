import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle, Plus, FileText } from 'lucide-react';
import Loader from '../../../utils/Loader';
import HallBillModal from './HallBillModal';
import HallNotesModal from './HallNotesModal';

const HallBookingList = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);

    // Notes State
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<any>('');
    const [noteBookingId, setNoteBookingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/hall/bookings');
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const openBill = (booking: any) => {
        setSelectedBooking(booking);
        setIsBillModalOpen(true);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader size={40} className="text-blue-600" />
            <p className="text-gray-500 font-medium animate-pulse">Loading Hall Bookings...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={22} className="text-blue-600" />
                    All Hall Bookings
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {bookings.length} Total
                </span>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                        <Calendar size={40} className="text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700">No Bookings Found</h4>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">There are no party hall bookings recorded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => {
                        const isCompleted = booking.status === 'COMPLETED';
                        const eventDate = new Date(booking.eventDate);

                        return (
                            <div
                                key={booking.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Header with status */}
                                <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setNoteBookingId(booking.id);
                                                setCurrentNote(booking.notes || '');
                                                setNoteModalOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-blue-600 transition p-1 hover:bg-blue-50 rounded"
                                            title="View Notes"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <span className="text-[10px] text-gray-400 font-mono">#{booking.id.substring(0, 8)}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex-1 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shrink-0">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{booking.guest?.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{booking.guest?.phoneNumber}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-dashed border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Event Date</p>
                                            <p className="text-sm font-bold text-gray-800">{eventDate.toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Guests</p>
                                            <p className="text-sm font-bold text-gray-800">{booking.guestCount || '-'}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Session</p>
                                            <p className="text-sm font-bold text-blue-700 capitalize">{booking.session.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Booking Amount</p>
                                            <p className="text-lg font-black text-gray-900">₹{booking.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-green-500' : 'text-orange-500'}`}>
                                                {isCompleted ? 'Paid Fully' : 'Advance Paid'}
                                            </p>
                                            <p className="text-sm font-bold text-gray-800">₹{booking.advanceAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => openBill(booking)}
                                    className="w-full p-4 bg-white hover:bg-blue-600 border-t flex items-center justify-between group/btn transition-all duration-300"
                                >
                                    <span className="flex items-center gap-2 font-bold text-sm text-gray-700 group-hover/btn:text-white">
                                        <CreditCard size={18} />
                                        {isCompleted ? 'View Full Bill' : 'View Bill & Settle'}
                                    </span>
                                    <ChevronRight size={18} className="text-gray-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <HallBillModal
                booking={selectedBooking}
                isOpen={isBillModalOpen}
                onClose={() => setIsBillModalOpen(false)}
                onSuccess={() => {
                    setIsBillModalOpen(false);
                    fetchBookings();
                }}
            />

            <HallNotesModal
                isOpen={noteModalOpen}
                onClose={() => setNoteModalOpen(false)}
                bookingId={noteBookingId}
                initialNotes={currentNote}
                onSuccess={fetchBookings}
            />
        </div>
    );
};

export default HallBookingList;
