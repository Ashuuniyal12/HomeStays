
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../features/auth/auth.store';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X, User, Clock, CheckCircle } from 'lucide-react';

const HallAvailabilityCalendar = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/hall/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Failed to fetch hall bookings", err);
        }
    };

    // Helper to check if a date has a booking
    const getBookingForDate = (day: number) => {
        // Construct local date string YYYY-MM-DD to avoid timezone shifts from toISOString()
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        return bookings.filter(b => b.eventDate.startsWith(dateStr));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <CalIcon className="text-blue-600" />
                        <span>Party Hall Bookings</span>
                    </div>
                    <span className="text-sm font-normal text-gray-500">
                        ({currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
                    </span>
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full border border-gray-100 shadow-sm"><ChevronLeft /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full border border-gray-100 shadow-sm"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="font-medium text-gray-500 text-xs sm:text-sm mb-2">{d}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayBookings = getBookingForDate(day);
                    const isBooked = dayBookings.length > 0;

                    return (
                        <div
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                min-h-[60px] sm:min-h-[70px] border rounded-lg p-1 sm:p-1.5 transition-all relative group flex flex-col cursor-pointer hover:shadow-md
                                ${isBooked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-200'}
                        `}>
                            <span className={`text-xs font-bold ${isBooked ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>

                            <div className="mt-1 space-y-0.5 overflow-hidden">
                                {dayBookings.map((b: any) => (
                                    <div key={b.id} className="text-[8px] sm:text-[10px] leading-tight bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate" title={`${b.session} • ${b.guest.name}`}>
                                        <span className="hidden sm:inline">{b.session === 'FULL_DAY' ? 'Full' : b.session.substring(0, 1) + b.session.substring(1).toLowerCase()} • </span>
                                        {b.guest.name.split(' ')[0]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Day Detail Modal */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

                        {/* Modal Header */}
                        <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <CalIcon size={20} className="text-blue-200" />
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })}
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">Party Hall Status</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-blue-500 rounded-full transition text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-gray-50 flex-1">
                            {(() => {
                                const activeBookings = getBookingForDate(selectedDate.getDate());

                                if (activeBookings.length > 0) {
                                    return (
                                        <div className="space-y-4">
                                            {activeBookings.map(booking => (
                                                <div key={booking.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {booking.session === 'FULL_DAY' ? 'FD' : booking.session.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 leading-tight">
                                                                {booking.session === 'FULL_DAY' ? 'Full Day' :
                                                                    booking.session === 'MORNING' ? 'Morning Session' : 'Evening Session'}
                                                            </h4>
                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Occupied</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-3 border-t border-dashed border-gray-100 space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <User size={14} className="text-blue-400" />
                                                            <span className="font-semibold">{booking.guest.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Clock size={14} className="text-blue-400" />
                                                            <span>
                                                                {booking.session === 'MORNING' ? '10:00 AM - 02:00 PM' :
                                                                    booking.session === 'EVENING' ? '06:00 PM - 10:00 PM' :
                                                                        '10:00 AM - 10:00 PM'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">All Clear!</h4>
                                            <p className="text-gray-500 text-sm mt-1">Party Hall is available for booking on this day.</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallAvailabilityCalendar;
