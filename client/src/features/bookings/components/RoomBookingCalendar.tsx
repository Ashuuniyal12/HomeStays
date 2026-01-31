import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { useAuth } from '../../auth/auth.store';

const RoomBookingCalendar = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // Fetch both active (active+upcoming) and past bookings to show full history
            const [activeRes, historyRes] = await Promise.all([
                axios.get('/api/bookings/active', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/bookings/history', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            // Merge and deduplicate
            const all = [...activeRes.data, ...historyRes.data];
            setBookings(all);
        } catch (err) {
            console.error("Failed to fetch room bookings", err);
        }
    };

    // Helper to check if a date lies within a booking range
    const getBookingsForDate = (day: number) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        targetDate.setHours(0, 0, 0, 0);

        return bookings.filter(b => {
            const start = new Date(b.checkIn);
            start.setHours(0, 0, 0, 0);

            const end = new Date(b.checkOut);
            end.setHours(0, 0, 0, 0);

            return targetDate >= start && targetDate < end; // Exclusive of checkout day typically
        });
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
                    <span>Room Bookings</span>
                    <span className="text-sm font-normal text-gray-500">
                        ({currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
                    </span>
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
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
                    const dayBookings = getBookingsForDate(day);
                    const isBooked = dayBookings.length > 0;

                    return (
                        <div key={day} className={`
                            min-h-[80px] border rounded-lg p-1.5 transition-all relative flex flex-col
                            ${isBooked ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'}
                        `}>
                            <span className={`text-xs font-bold ${isBooked ? 'text-purple-700' : 'text-gray-700'}`}>{day}</span>

                            <div className="mt-1 space-y-1 overflow-hidden overflow-y-auto custom-scrollbar max-h-[60px]">
                                {dayBookings.map((b: any) => (
                                    <div key={b.id} className="text-[10px] leading-tight bg-purple-100 text-purple-700 px-1.5 py-1 rounded truncate border border-purple-200 text-left" title={`Room ${b.room.number} • ${b.guest.name}`}>
                                        <span className="font-bold">R{b.room.number}</span> <span className="opacity-75">{b.guest.name.split(' ')[0]}</span>
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

export default RoomBookingCalendar;
