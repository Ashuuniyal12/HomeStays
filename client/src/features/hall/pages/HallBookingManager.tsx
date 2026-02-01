
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
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500" style={{ fontFamily: '"Inter", sans-serif' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Party Hall Management</h2>
                    <p className="text-gray-500">Manage bookings for weddings, parties, and events.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus size={20} />
                    New Hall Booking
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setView('calendar')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${view === 'calendar'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Calendar & Bookings
                </button>
                <button
                    onClick={() => setView('guests')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${view === 'guests'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Guests
                </button>
            </div>

            {view === 'calendar' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Calendar Section - Smaller width */}
                    <div className="lg:col-span-4 h-fit bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <HallAvailabilityCalendar key={`cal-${refreshKey}`} />
                    </div>

                    {/* Booking List Section - Remaining width */}
                    <div className="lg:col-span-8">
                        <HallBookingList key={`list-${refreshKey}`} />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <HallGuestList key={`guest-${refreshKey}`} />
                </div>
            )}

            {isModalOpen && (
                <NewHallBookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default HallBookingManager;
