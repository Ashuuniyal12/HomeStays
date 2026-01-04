import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.store';
import { LogOut, ShoppingBag, Clock, FileText, Menu, X } from 'lucide-react';

import FoodMenu from '../../menu/components/FoodMenu';
import OrderHistory from '../../orders/components/OrderHistory';
import BillView from '../../billing/components/BillView';

const GuestDashboard = () => {
    const { logout, user } = useAuth();
    const [booking, setBooking] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('menu'); // menu | orders | bill
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get('/api/bookings/my-booking');
                setBooking(res.data);
            } catch (err) {
                console.error('No active booking');
            }
        };
        if (user) fetchBooking();
    }, [user]);

    if (!booking) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="animate-pulse">Loading Your Stay Details...</div>
        </div>
    );

    const NavItem = ({ icon, label, id }: { icon: any, label: string, id: string }) => (
        <button
            onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-4 transition-colors ${activeTab === id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
            <div className="mr-4">{icon}</div>
            <span className="font-medium text-lg">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-white flex-col shadow-lg z-10">
                <div className="p-8 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">Homestay</h1>
                    <p className="text-sm text-gray-400 mt-1">Welcome, {user?.name}</p>
                </div>

                <nav className="flex-1 mt-6">
                    <NavItem icon={<ShoppingBag size={22} />} label="Dining Menu" id="menu" />
                    <NavItem icon={<Clock size={22} />} label="My Orders" id="orders" />
                    <NavItem icon={<FileText size={22} />} label="My Bill" id="bill" />
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Room Details</p>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Room</span>
                                <span className="font-bold text-gray-800">{booking.room.number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Checkout</span>
                                <span className="font-bold text-gray-800">{new Date(booking.checkOut).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition">
                        <LogOut size={18} className="mr-2" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">Homestay</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500"><X size={24} /></button>
                </div>
                <nav className="mt-4">
                    <NavItem icon={<ShoppingBag size={22} />} label="Dining Menu" id="menu" />
                    <NavItem icon={<Clock size={22} />} label="My Orders" id="orders" />
                    <NavItem icon={<FileText size={22} />} label="My Bill" id="bill" />
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
                    <button onClick={logout} className="w-full flex items-center justify-center px-4 py-3 text-red-600 font-bold">
                        <LogOut size={18} className="mr-2" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800">Room {booking.room.number}</span>
                    <div className="w-6"></div> {/* Spacer for centering */}
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-8 hidden md:block">
                            <h2 className="text-3xl font-bold text-gray-800">
                                {activeTab === 'menu' && 'Dining Menu'}
                                {activeTab === 'orders' && 'Order History'}
                                {activeTab === 'bill' && 'Your Invoice'}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {activeTab === 'menu' && 'Delicious meals delivered to your room.'}
                                {activeTab === 'orders' && 'Track your current and past orders.'}
                                {activeTab === 'bill' && 'Real-time summary of your stay charges.'}
                            </p>
                        </header>

                        {activeTab === 'menu' && <FoodMenu bookingId={booking.id} />}
                        {activeTab === 'orders' && <OrderHistory bookingId={booking.id} />}
                        {activeTab === 'bill' && <BillView bookingId={booking.id} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GuestDashboard;
