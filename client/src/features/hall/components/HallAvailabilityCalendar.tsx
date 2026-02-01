
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../features/auth/auth.store';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const HallAvailabilityCalendar = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

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
                        <div key={day} className={`
                            min-h-[60px] sm:min-h-[70px] border rounded-lg p-1 sm:p-1.5 transition-all relative group flex flex-col
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
        </div>
    );
};

export default HallAvailabilityCalendar;
