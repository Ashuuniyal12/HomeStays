import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X, CheckCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../../auth/auth.store';

const RoomBookingCalendar = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [activeRes, historyRes, roomsRes] = await Promise.all([
                axios.get('/api/bookings/active', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/bookings/history', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const allBookings = [...activeRes.data, ...historyRes.data];
            setBookings(allBookings);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error("Failed to fetch calendar data", err);
        }
    };

    // Helper to check if a date lies within a booking range
    const getBookingsForDate = (date: Date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return bookings.filter(b => {
            const start = new Date(b.checkIn);
            start.setHours(0, 0, 0, 0);

            const end = new Date(b.checkOut);
            end.setHours(0, 0, 0, 0);

            return targetDate >= start && targetDate < end;
        });
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
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CalIcon className="text-blue-600" />
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
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayBookings = getBookingsForDate(date);
                    const isBooked = dayBookings.length > 0;

                    return (
                        <div
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                min-h-[80px] border rounded-lg p-1.5 transition-all relative flex flex-col cursor-pointer hover:shadow-md
                                ${isBooked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-200'}
                            `}
                        >
                            <span className={`text-xs font-bold ${isBooked ? 'text-blue-700' : 'text-gray-700'}`}>{day}</span>

                            <div className="mt-1 space-y-1 overflow-hidden overflow-y-auto custom-scrollbar max-h-[60px]">
                                {dayBookings.map((b: any) => (
                                    <div key={b.id} className="text-[10px] leading-tight bg-blue-100 text-blue-700 px-1.5 py-1 rounded truncate border border-blue-200 text-left">
                                        <span className="font-bold">R{b.room.number}</span> <span className="opacity-75">{b.guest.name.split(' ')[0]}</span>
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <CalIcon size={20} className="text-blue-200" />
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })}
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">Room Status Overview</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-blue-500 rounded-full transition text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Room List */}
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-3">
                            {rooms.sort((a, b) => parseInt(a.number) - parseInt(b.number)).map(room => {
                                // Find booking for this room on the selected date
                                const activeBooking = getBookingsForDate(selectedDate).find(b => b.roomId === room.id);

                                return (
                                    <div key={room.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                                        {/* Room Info */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                                ${activeBooking ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                                            `}>
                                                {room.number}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{room.type}</h4>
                                                    {!activeBooking && <CheckCircle size={14} className="text-green-500" />}
                                                </div>
                                                <p className="text-xs text-gray-500">Price: ₹{room.price}</p>
                                            </div>
                                        </div>

                                        {/* Status & Booking Details */}
                                        <div className="flex-1 w-full sm:w-auto pl-0 sm:pl-4 border-l-0 sm:border-l border-gray-100">
                                            {activeBooking ? (
                                                <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100 w-full">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <User size={14} className="text-blue-500" />
                                                        <span className="font-bold text-blue-900 text-sm truncate">{activeBooking.guest.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                                        <Clock size={12} />
                                                        <span>
                                                            {new Date(activeBooking.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                            {new Date(activeBooking.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    <span className="text-sm font-bold">Available</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomBookingCalendar;
