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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myRooms.map(room => (
                <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2 ">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{room.number}</h3>
                            <p className={`text-xs font-semibold px-2.5 py-1 rounded-md border mt-1 inline-block ${getRoomTypeColor(room.type)}`}>
                                {room.type}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">₹{room.price}</p>
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full mt-1 inline-block
                                ${room.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    room.status === 'OCCUPIED' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                {room.status}
                            </span>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex space-x-4 my-4 text-gray-600 text-sm border-t border-b py-3 border-gray-50 bg-gray-50/50 -mx-5 px-5">
                        <div className="flex items-center space-x-1.5" title="Occupancy">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-medium">{room.occupancy} <span className="text-xs text-gray-400 font-normal">Guests</span></span>
                        </div>
                        <div className="flex items-center space-x-1.5" title="Bathrooms">
                            <Bath size={16} className="text-gray-400" />
                            <span className="font-medium">{(room as any).bathroomCount || 1} <span className="text-xs text-gray-400 font-normal">Baths</span></span>
                        </div>
                        {(room as any).hasBalcony && (
                            <div className="flex items-center space-x-1.5 text-blue-600" title="Balcony">
                                <Mountain size={16} />
                                <span className="xs:hidden font-medium">Balcony</span>
                            </div>
                        )}
                        {(room as any).isAC && (
                            <div className="flex items-center space-x-1.5 text-blue-600" title="AC">
                                <Wind size={16} />
                                <span className="xs:hidden font-medium">AC</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(room)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this room?')) onDelete(room.id);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyRooms;
