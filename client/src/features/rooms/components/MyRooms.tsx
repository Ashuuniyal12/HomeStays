import React from 'react';
import { Users, Bath, Wind, Mountain, Pencil, Trash2 } from 'lucide-react';

interface Room {
    id: number;
    number: string;
    type: string;
    price: number;
    occupancy: number;
    status: string;
    ownerId?: string;
    hasBalcony?: boolean;
    isAC?: boolean;
    bathroomCount?: number;
}

interface MyRoomsProps {
    rooms: Room[];
    currentUserId: string;
    onEdit: (room: Room) => void;
    onDelete: (id: number) => void;
}

const MyRooms: React.FC<MyRoomsProps> = ({ rooms, currentUserId, onEdit, onDelete }) => {
    // Filter rooms owned by the user
    const myRooms = rooms.filter(r => r.ownerId === currentUserId);

    const getRoomTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'deluxe': return 'bg-violet-50 text-violet-700 border-violet-100';
            case 'suite': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'family': return 'bg-sky-50 text-sky-700 border-sky-100';
            case 'standard':
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    if (myRooms.length === 0) {
        return (
            <div className="p-8 bg-gray-50 text-center rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">You haven't added any rooms yet.</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add New Room" to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myRooms.map(room => (
                <div
                    key={room.id}
                    className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row group gap-5 relative overflow-hidden
                        ${room.status === 'CLEANING' ? 'bg-yellow-50 border-yellow-400 border-2' :
                            room.status === 'OCCUPIED' ? 'bg-red-50 border-red-300 border-2' :
                                room.status === 'MAINTENANCE' ? 'bg-gray-100 border-gray-400 border-2' :
                                    'bg-white border-gray-100'}`}
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

                    {/* Left: Info */}
                    <div className="flex-1 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-bold text-gray-800">Room {room.number}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getRoomTypeColor(room.type)}`}>
                                        {room.type}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                                    {(room as any).description || `A spacious ${room.type.toLowerCase()} room with modern amenities.`}
                                </p>
                            </div>
                            <div className="text-right sm:hidden">
                                <p className="text-lg font-bold text-blue-600">₹{room.price}</p>
                            </div>
                        </div>

                        {/* Amenities Grid */}
                        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md" title="Occupancy">
                                <Users size={14} className="text-gray-400" />
                                <span className="font-medium">{room.occupancy}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md" title="Bathrooms">
                                <Bath size={14} className="text-gray-400" />
                                <span className="font-medium">{(room as any).bathroomCount || 1}</span>
                            </div>
                            {(room as any).hasBalcony && (
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                    <Mountain size={14} />
                                    <span className="font-medium text-xs">Balcony</span>
                                </div>
                            )}
                            {(room as any).isAC && (
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                    <Wind size={14} />
                                    <span className="font-medium text-xs">AC</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-row sm:flex-col justify-between items-end min-w-[100px] border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-5 relative z-10">
                        <div className="hidden sm:block text-right">
                            <p className="text-xl font-bold text-blue-600">₹{room.price}</p>
                            <span className={`block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-center
                                ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                    room.status === 'OCCUPIED' ? 'bg-red-100 text-red-700' :
                                        room.status === 'MAINTENANCE' ? 'bg-gray-200 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                {room.status}
                            </span>
                        </div>

                        {/* Mobile Status */}
                        <span className={`sm:hidden text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                                ${room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                room.status === 'OCCUPIED' ? 'bg-red-100 text-red-700' :
                                    room.status === 'MAINTENANCE' ? 'bg-gray-200 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'}`}>
                            {room.status}
                        </span>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => onEdit(room)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this room?')) onDelete(room.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyRooms;
