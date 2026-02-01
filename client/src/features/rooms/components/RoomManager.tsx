import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../auth/auth.store';
import RoomGantt from './RoomGantt';
import MyRooms from './MyRooms';
import TodaysRoomStatus from './TodaysRoomStatus';
import Loader from '../../../utils/Loader';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const RoomManager = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editRoomData, setEditRoomData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // New Room State
    const [newRoom, setNewRoom] = useState({
        number: '', type: 'Standard', price: '', occupancy: '', description: '',
        hasBalcony: false, isAC: false, bathroomCount: '1'
    });

    // Gantt Controls
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d;
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const validateRoom = (room: any) => {
        if (!room.number?.trim()) return "Room Number is required";
        if (!room.type) return "Room Type is required";
        if (parseFloat(room.price) <= 0 || isNaN(parseFloat(room.price))) return "Price must be greater than 0";
        if (parseInt(room.occupancy) <= 0 || isNaN(parseInt(room.occupancy))) return "Occupancy must be greater than 0";
        if (parseInt(room.bathroomCount) < 0 || isNaN(parseInt(room.bathroomCount))) return "Bathroom count cannot be negative";
        return null;
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateRoom(newRoom);
        if (error) {
            toast.error(error);
            return;
        }

        setIsProcessing(true);
        try {
            await axios.post('/api/rooms', newRoom);
            setIsAdding(false);
            toast.success('Room added successfully');
            setNewRoom({
                number: '', type: 'Standard', price: '', occupancy: '', description: '',
                hasBalcony: false, isAC: false, bathroomCount: '1'
            });
            fetchRooms();
        } catch (err: any) {
            toast.error('Failed to add room: ' + (err.response?.data?.details || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditRoom = (room: any) => {
        setEditRoomData(room);
        setIsEditing(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRoomData) return;

        const error = validateRoom(editRoomData);
        if (error) {
            toast.error(error);
            return;
        }

        setIsProcessing(true);
        try {
            await axios.put(`/api/rooms/${editRoomData.id}`, {
                ...editRoomData,
                price: parseFloat(editRoomData.price),
                occupancy: parseInt(editRoomData.occupancy)
            });
            setIsEditing(false);
            setEditRoomData(null);
            toast.success('Room updated successfully');
            fetchRooms();
        } catch (err: any) {
            toast.error('Failed to update room: ' + (err.response?.data?.details || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteRoom = async (id: number) => {
        setIsProcessing(true);
        try {
            await axios.delete(`/api/rooms/${id}`);
            toast.success('Room deleted successfully');
            fetchRooms();
        } catch (err: any) {
            toast.error('Failed to delete room: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    // Date navigation
    const shiftDate = (days: number) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + days);
        setStartDate(d);
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Loader Modal */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={48} className="text-blue-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Processing...</h3>
                        <p className="text-gray-500 text-sm mt-1">Please wait a moment.</p>
                    </div>
                </div>
            )}

            {/* Gantt Chart Section */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-semibold text-gray-800">Room Availability</h3>

                    {/* Improved Date Shifter */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-full md:w-auto justify-between">
                        <button
                            onClick={() => shiftDate(-7)}
                            className="p-2 hover:bg-gray-50 rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                            title="Previous Week"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center px-4 font-medium text-gray-700 select-none min-w-[160px] justify-center border-l border-r border-gray-100 mx-1">
                            <Calendar size={16} className="mr-2.5 text-blue-500" />
                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => shiftDate(7)}
                            className="p-2 hover:bg-gray-50 rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                            title="Next Week"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                {/* Scrollable Container for Mobile */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="min-w-[800px]">
                        <RoomGantt rooms={rooms} startDate={startDate} daysToShow={14} />
                    </div>
                </div>
            </section>

            {/* Split View: My Rooms & Today's Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: My Rooms (Editable) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">My Rooms</h3>
                        <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base">
                            {isAdding ? 'Cancel' : <span>+ Add New Room</span>}
                        </button>
                    </div>

                    {/* Add Room Form */}
                    {isAdding && (
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow border animate-fade-in mb-6">
                            <h3 className="text-lg font-bold mb-4">Add New Room</h3>
                            <form onSubmit={handleAddRoom} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-bold mb-1">Room Number <span className="text-red-500">*</span></label>
                                        <input required type="text" className="w-full border p-2 rounded" value={newRoom.number} onChange={e => setNewRoom({ ...newRoom, number: e.target.value })} />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-bold mb-1">Type <span className="text-red-500">*</span></label>
                                        <select className="w-full border p-2 rounded" value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value })}>
                                            <option value="Standard">Standard</option>
                                            <option value="Deluxe">Deluxe</option>
                                            <option value="Suite">Suite</option>
                                            <option value="Family">Family</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-bold mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                        <input required min="1" type="number" className="w-full border p-2 rounded" value={newRoom.price} onChange={e => setNewRoom({ ...newRoom, price: e.target.value })} />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-bold mb-1">Occupancy <span className="text-red-500">*</span></label>
                                        <input required min="1" type="number" className="w-full border p-2 rounded" value={newRoom.occupancy} onChange={e => setNewRoom({ ...newRoom, occupancy: e.target.value })} />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-bold mb-1">Bathrooms <span className="text-red-500">*</span></label>
                                        <input required type="number" min="0" className="w-full border p-2 rounded" value={newRoom.bathroomCount} onChange={e => setNewRoom({ ...newRoom, bathroomCount: e.target.value })} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold mb-1">Description</label>
                                    <textarea
                                        className="w-full border p-2 rounded resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={2}
                                        value={newRoom.description}
                                        onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                                        placeholder="E.g. Sea view, corner room on 2nd floor, newly renovated..."
                                    />
                                </div>

                                {/* Amenities Checkboxes */}
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-t pt-4">
                                    <div className="flex gap-6">
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="addHasBalcony" className="w-4 h-4" checked={newRoom.hasBalcony} onChange={e => setNewRoom({ ...newRoom, hasBalcony: e.target.checked })} />
                                            <label htmlFor="addHasBalcony" className="text-sm font-bold">Balcony</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="addIsAC" className="w-4 h-4" checked={newRoom.isAC} onChange={e => setNewRoom({ ...newRoom, isAC: e.target.checked })} />
                                            <label htmlFor="addIsAC" className="text-sm font-bold">AC</label>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full sm:w-auto ml-auto bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Save Room</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {user && <MyRooms rooms={rooms} currentUserId={user.id} onEdit={handleEditRoom} onDelete={handleDeleteRoom} />}
                </div>

                {/* Right Side: Today's Status (Read Only) */}
                <div className="lg:col-span-4 sticky top-6">
                    <TodaysRoomStatus rooms={rooms} onRefresh={fetchRooms} />
                </div>
            </div>

            {/* Edit Room Modal */}
            {isEditing && editRoomData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Edit Room {editRoomData.number}</h3>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Room Number <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full border p-2 rounded" value={editRoomData.number} onChange={e => setEditRoomData({ ...editRoomData, number: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={2}
                                    value={editRoomData.description || ''}
                                    onChange={e => setEditRoomData({ ...editRoomData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Type <span className="text-red-500">*</span></label>
                                    <select className="w-full border p-2 rounded" value={editRoomData.type} onChange={e => setEditRoomData({ ...editRoomData, type: e.target.value })}>
                                        <option value="Standard">Standard</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Family">Family</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Status</label>
                                    <select className="w-full border p-2 rounded" value={editRoomData.status} onChange={e => setEditRoomData({ ...editRoomData, status: e.target.value })}>
                                        <option value="AVAILABLE">Available</option>
                                        <option value="OCCUPIED">Occupied</option>
                                        <option value="CLEANING">Cleaning</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                    <input required min="1" type="number" className="w-full border p-2 rounded" value={editRoomData.price} onChange={e => setEditRoomData({ ...editRoomData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Occupancy <span className="text-red-500">*</span></label>
                                    <input required min="1" type="number" className="w-full border p-2 rounded" value={editRoomData.occupancy} onChange={e => setEditRoomData({ ...editRoomData, occupancy: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="editHasBalcony" className="w-4 h-4" checked={!!editRoomData.hasBalcony} onChange={e => setEditRoomData({ ...editRoomData, hasBalcony: e.target.checked })} />
                                    <label htmlFor="editHasBalcony" className="text-sm font-medium">Balcony</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="editIsAC" className="w-4 h-4" checked={!!editRoomData.isAC} onChange={e => setEditRoomData({ ...editRoomData, isAC: e.target.checked })} />
                                    <label htmlFor="editIsAC" className="text-sm font-medium">AC</label>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1">Bathrooms <span className="text-red-500">*</span></label>
                                    <input required type="number" min="0" className="w-full border p-2 rounded" value={editRoomData.bathroomCount || 1} onChange={e => setEditRoomData({ ...editRoomData, bathroomCount: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;
