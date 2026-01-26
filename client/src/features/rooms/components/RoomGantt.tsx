import React from 'react';

interface Booking {
    id: string;
    checkIn: string; // ISO date
    checkOut: string;
    guestName?: string; // or fetch from guest relation
    guest?: { name: string };
    status: string;
}

interface Room {
    id: number;
    number: string;
    type: string;
    bookings: Booking[];
}

interface RoomGanttProps {
    rooms: Room[];
    startDate: Date;
    daysToShow: number;
}

const RoomGantt: React.FC<RoomGanttProps> = ({ rooms, startDate, daysToShow = 14 }) => {
    // Generate dates header
    const dates = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    const getBookingStyle = (booking: Booking) => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        const chartStart = startDate;
        const chartEnd = new Date(startDate);
        chartEnd.setDate(chartEnd.getDate() + daysToShow);

        // Calculate overlap
        const effectiveStart = start < chartStart ? chartStart : start;
        const effectiveEnd = end > chartEnd ? chartEnd : end;

        // If no overlap
        if (effectiveEnd <= effectiveStart) return null;

        const totalMs = daysToShow * 24 * 60 * 60 * 1000;
        const startOffsetMs = effectiveStart.getTime() - chartStart.getTime();
        const durationMs = effectiveEnd.getTime() - effectiveStart.getTime();

        const leftPct = (startOffsetMs / totalMs) * 100;
        const widthPct = (durationMs / totalMs) * 100;

        return {
            left: `${leftPct}%`,
            width: `${widthPct}%`,
        };
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const today = new Date();

    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header */}
                <div className="flex border-b">
                    <div className="w-40 p-4 font-bold border-r sticky left-0 bg-white z-10">Room</div>
                    <div className="flex-1 flex">
                        {dates.map((date, i) => {
                            const isToday = isSameDay(date, today);
                            return (
                                <div key={i} className={`flex-1 p-2 text-center text-sm border-r min-w-[50px] ${isToday ? 'bg-red-100/70 text-red-700 font-bold' : ''}`}>
                                    <div className="font-bold">{date.getDate()}</div>
                                    <div className={`text-xs ${isToday ? 'text-red-600' : 'text-gray-500'}`}>{date.toLocaleString('default', { month: 'short' })}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="relative">
                    {/* Vertical grid lines - WITH TODAY HIGHLIGHT */}
                    <div className="absolute inset-0 flex ml-40 pointer-events-none z-0">
                        {dates.map((date, i) => {
                            const isToday = isSameDay(date, today);
                            return (
                                <div key={i} className={`flex-1 border-r border-gray-100 last:border-0 ${isToday ? 'bg-red-100/40' : ''}`}></div>
                            );
                        })}
                    </div>

                    {rooms.map(room => (
                        <div key={room.id} className="flex border-b relative hover:bg-gray-50">
                            <div className="w-40 p-4 border-r font-medium sticky left-0 bg-white z-10 flex flex-col justify-center">
                                <span>{room.number}</span>
                                <span className="text-xs text-gray-500">{room.type}</span>
                            </div>
                            <div className="flex-1 relative h-16">
                                {room.bookings.map(booking => {
                                    const style = getBookingStyle(booking);
                                    if (!style) return null;
                                    return (
                                        <div
                                            key={booking.id}
                                            className={`absolute top-2 bottom-2 rounded-md px-2 flex items-center text-xs text-white overflow-hidden whitespace-nowrap shadow-sm
                                                ${booking.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-400'}
                                            `}
                                            style={style}
                                            title={`${booking.guest?.name || 'Guest'} (${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()})`}
                                        >
                                            {booking.guest?.name || 'Booked'}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomGantt;
