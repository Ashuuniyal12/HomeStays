
import React, { useState } from 'react';
import '@fontsource/inter'; // Defaults to weight 400
import { Calendar, Plus } from 'lucide-react';
import HallAvailabilityCalendar from '../components/HallAvailabilityCalendar';
import NewHallBookingModal from '../components/NewHallBookingModal';
import HallGuestList from '../components/HallGuestList';
import HallBookingList from '../components/HallBookingList';

const HallBookingManager = () => {
    const [view, setView] = useState<'calendar' | 'guests'>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500" style={{ fontFamily: '"Inter", sans-serif' }}>
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Party Hall Management</h2>
                    <p className="text-gray-500">Manage bookings for weddings, parties, and events.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    New Hall Booking
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setView('calendar')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'calendar'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Calendar & Bookings
                </button>
                <button
                    onClick={() => setView('guests')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'guests'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Guests
                </button>
            </div>

            {view === 'calendar' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Calendar Section - Smaller width */}
                    <div className="lg:col-span-4 h-fit bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <HallAvailabilityCalendar />
                    </div>

                    {/* Booking List Section - Remaining width */}
                    <div className="lg:col-span-8">
                        <HallBookingList />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <HallGuestList />
                </div>
            )}

            {isModalOpen && (
                <NewHallBookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        // Trigger refresh if needed
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default HallBookingManager;
