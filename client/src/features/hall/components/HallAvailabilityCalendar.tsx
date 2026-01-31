
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
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        return bookings.filter(b => b.eventDate.startsWith(dateStr));
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CalIcon className="text-purple-600" />
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="font-medium text-gray-500 text-sm mb-2">{d}</div>
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
                            min-h-[100px] border rounded-lg p-2 transition-all relative group
                            ${isBooked ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-purple-200'}
                        `}>
                            <span className={`text-sm font-bold ${isBooked ? 'text-purple-700' : 'text-gray-700'}`}>{day}</span>

                            <div className="mt-1 space-y-1">
                                {dayBookings.map((b: any) => (
                                    <div key={b.id} className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded truncate" title={b.purpose}>
                                        {b.session === 'FULL_DAY' ? 'Full Day' : b.session} • {b.guest.name}
                                    </div>
                                ))}
                                {!isBooked && (
                                    <div className="text-xs text-gray-400 mt-4 opacity-0 group-hover:opacity-100 items-center justify-center flex">
                                        Available
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HallAvailabilityCalendar;
