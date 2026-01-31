
import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import HallAvailabilityCalendar from '../components/HallAvailabilityCalendar';
import NewHallBookingModal from '../components/NewHallBookingModal';

const HallBookingManager = () => {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Party Hall Management</h2>
                    <p className="text-gray-500">Manage bookings for weddings, parties, and events.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    New Hall Booking
                </button>
            </div>

            {/* View Toggle (Future: List View) */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <HallAvailabilityCalendar />
            </div>

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
