import React from 'react';

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
                            <p className="text-sm text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{room.type}</p>
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
                    <div className="flex space-x-3 my-4 text-gray-600 text-sm">
                        <div className="flex items-center space-x-1" title="Occupancy">
                            <span>👥</span>
                            <span>{room.occupancy}</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Bathrooms">
                            <span>🚿</span>
                            <span>{(room as any).bathroomCount || 1}</span>
                        </div>
                        {(room as any).hasBalcony && (
                            <div className="flex items-center space-x-1 text-blue-600" title="Balcony">
                                <span>🏞️</span>
                                <span className="xs:hidden">Balcony</span>
                            </div>
                        )}
                        {(room as any).isAC && (
                            <div className="flex items-center space-x-1 text-blue-600" title="AC">
                                <span>❄️</span>
                                <span className="xs:hidden">AC</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-4 border-t pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(room)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this room?')) onDelete(room.id);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyRooms;
