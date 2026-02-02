import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Calendar, CheckCircle, XCircle, Clock, AlertCircle, X, ChevronRight } from 'lucide-react';
import Loader from '../../../utils/Loader';

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
    onRefresh?: () => void;
}

const TodaysRoomStatus: React.FC<TodaysRoomStatusProps> = ({ rooms, onRefresh }) => {
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Helper to find a booking that implies the room is physically occupied right now.
    // This includes:
    // 1. Current stays (Check-in <= Today < Check-out)
    // 2. Overstays (Check-in < Check-out <= Today, but strictly still ACTIVE status)
    const getEffectiveOccupant = (room: Room) => {
        if (!room.bookings) return null;
        return room.bookings.find(booking => {
            // Must be ACTIVE to count as physically occupying the room
            if (booking.status !== 'ACTIVE') return false;

            const start = new Date(booking.checkIn);
            start.setHours(0, 0, 0, 0);

            // If the booking started today or in the past, and hasn't been completed/checked-out (still ACTIVE),
            // then the guest is effectively in the room.
            return start.getTime() <= today.getTime();
        });
    };

    const handleStatusUpdate = async (roomId: number, roomNumber: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            await axios.patch(`/api/rooms/${roomId}/status`, { status: newStatus });
            toast.success(`Room ${roomNumber} marked as ${newStatus}`);
            if (onRefresh) onRefresh();
            setEditingRoomId(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const statusOptions = [
        { value: 'AVAILABLE', label: 'Available', color: 'green', icon: CheckCircle },
        { value: 'CLEANING', label: 'Cleaning', color: 'yellow', icon: Clock },
        { value: 'MAINTENANCE', label: 'Maintenance', color: 'gray', icon: AlertCircle },
        { value: 'OCCUPIED', label: 'Occupied', color: 'red', icon: XCircle },
    ];

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
                        const activeBooking = getEffectiveOccupant(room);

                        let displayStatus = room.status;

                        if (activeBooking) {
                            // If there is an active occupant, force status to OCCUPIED on UI
                            displayStatus = 'OCCUPIED';
                        } else if (room.status === 'OCCUPIED') {
                            // Edge Case: DB says OCCUPIED, but we found no active occupant for today/past.
                            // This likely means the room is marked OCCUPIED for a FUTURE booking (prematurely).

                            // Check if there is a purely future active booking
                            const hasFutureBooking = room.bookings?.some(b => {
                                if (b.status !== 'ACTIVE') return false;
                                const start = new Date(b.checkIn);
                                start.setHours(0, 0, 0, 0);
                                return start.getTime() > today.getTime();
                            });

                            if (hasFutureBooking) {
                                // Correct the display to AVAILABLE since the guest hasn't arrived yet
                                displayStatus = 'AVAILABLE';
                            }
                        }

                        const isOccupied = displayStatus === 'OCCUPIED';
                        const isEditing = editingRoomId === room.id;

                        // Inline Edit Mode
                        if (isEditing) {
                            return (
                                <div key={room.id} className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-md animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                            Update Room {room.number}
                                        </div>
                                        <button
                                            onClick={() => setEditingRoomId(null)}
                                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {isUpdating ? (
                                        <div className="py-6 flex justify-center">
                                            <Loader size={24} className="text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {statusOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleStatusUpdate(room.id, room.number, opt.value)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded border transition-all
                                                        ${room.status === opt.value ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'}
                                                    `}
                                                >
                                                    <opt.icon size={16} className={`mb-1 ${opt.color === 'green' ? 'text-green-600' :
                                                        opt.color === 'yellow' ? 'text-yellow-600' :
                                                            opt.color === 'red' ? 'text-red-600' : 'text-gray-600'
                                                        }`} />
                                                    <span className={`text-[10px] font-bold uppercase ${room.status === opt.value ? 'text-blue-700' : 'text-gray-600'
                                                        }`}>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Normal Display Mode
                        return (
                            <div
                                key={room.id}
                                className={`group relative p-3 rounded-lg transition-all border-2 mb-2
                                    ${displayStatus === 'CLEANING' ? 'bg-yellow-50 border-yellow-400' :
                                        displayStatus === 'OCCUPIED' ? 'bg-red-50 border-red-300' :
                                            displayStatus === 'MAINTENANCE' ? 'bg-gray-100 border-gray-400' :
                                                'bg-white border-gray-100 hover:border-gray-200'}`}
                            >
                                {/* Pattern Overlay for Special States */}
                                {(displayStatus === 'CLEANING' || displayStatus === 'OCCUPIED' || displayStatus === 'MAINTENANCE') && (
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
                                        <button
                                            onClick={() => setEditingRoomId(room.id)}
                                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer ${displayStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' :
                                                displayStatus === 'OCCUPIED' ? 'bg-white/80 text-red-700 border-red-200 hover:bg-red-100' :
                                                    displayStatus === 'CLEANING' ? 'bg-white/80 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                                                        'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                                                }`}
                                            title="Click to change status"
                                        >
                                            {displayStatus}
                                        </button>
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
                                        room.status !== 'AVAILABLE' && ( // Keep original status check for cleaning/maintenance message? 
                                            // Actually, if we are displaying AVAILABLE because it was falsely OCCUPIED, we shouldn't show "Currently not available"
                                            displayStatus !== 'AVAILABLE' && (
                                                <p className="text-xs text-gray-500 mt-1 italic font-medium">
                                                    {displayStatus === 'CLEANING' ? 'Housekeeping in progress' : 'Currently not available'}
                                                </p>
                                            )
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
