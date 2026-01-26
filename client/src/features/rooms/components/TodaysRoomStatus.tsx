import React from 'react';
import { User, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Booking {
    id: string;
    checkIn: string;
    checkOut: string;
    guestName?: string;
    guest?: { name: string };
    status: string;
}

interface Room {
    id: number;
    number: string;
    type: string;
    status: string;
    bookings?: Booking[];
}

interface TodaysRoomStatusProps {
    rooms: Room[];
}

const TodaysRoomStatus: React.FC<TodaysRoomStatusProps> = ({ rooms }) => {
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getTodaysBooking = (room: Room) => {
        if (!room.bookings) return null;
        return room.bookings.find(booking => {
            const start = new Date(booking.checkIn);
            const end = new Date(booking.checkOut);
            // Check if today falls within the booking range
            return today >= new Date(start.setHours(0, 0, 0, 0)) && today < new Date(end.setHours(0, 0, 0, 0));
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Today's Status
                </h3>
                <span className="text-sm font-medium text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {rooms.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">No rooms found.</div>
                ) : (
                    rooms.map(room => {
                        const activeBooking = getTodaysBooking(room);
                        const isOccupied = room.status === 'OCCUPIED' || !!activeBooking;

                        return (
                            <div
                                key={room.id}
                                className={`group relative p-3 rounded-lg transition-all border-2 mb-2
                                    ${room.status === 'CLEANING' ? 'bg-yellow-50 border-yellow-400' :
                                        room.status === 'OCCUPIED' ? 'bg-red-50 border-red-300' :
                                            room.status === 'MAINTENANCE' ? 'bg-gray-100 border-gray-400' :
                                                'bg-white border-gray-100 hover:border-gray-200'}`}
                            >
                                {/* Pattern Overlay for Special States */}
                                {(room.status === 'CLEANING' || room.status === 'OCCUPIED' || room.status === 'MAINTENANCE') && (
                                    <div className="absolute inset-0 pointer-events-none opacity-10"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`,
                                            backgroundSize: '10px 10px'
                                        }}
                                    />
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">Room {room.number}</span>
                                            <span className="text-xs text-gray-500 font-medium px-1.5 py-0.5 bg-white/50 rounded backdrop-blur-sm border border-gray-200/50">{room.type}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shadow-sm ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                room.status === 'OCCUPIED' ? 'bg-white/80 text-red-700 border-red-200' :
                                                    room.status === 'CLEANING' ? 'bg-white/80 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-200 text-gray-700 border-gray-300'
                                            }`}>
                                            {room.status}
                                        </span>
                                    </div>

                                    {/* Booking Details if Occupied */}
                                    {isOccupied && activeBooking ? (
                                        <div className="mt-2 text-sm bg-white/60 rounded-md p-2 border border-gray-200/50 backdrop-blur-sm">
                                            <div className="flex items-center gap-2 text-gray-800 font-bold mb-1">
                                                <User size={14} className="text-blue-600" />
                                                <span>{activeBooking.guest?.name || activeBooking.guestName || 'Guest'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    Check-in: {new Date(activeBooking.checkIn).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    Check-out: {new Date(activeBooking.checkOut).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        room.status !== 'AVAILABLE' && (
                                            <p className="text-xs text-gray-500 mt-1 italic font-medium">
                                                {room.status === 'CLEANING' ? 'Housekeeping in progress' : 'Currently not available'}
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TodaysRoomStatus;
