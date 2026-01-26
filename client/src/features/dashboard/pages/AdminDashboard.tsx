import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.store';
import { LogOut, Home, Coffee, Users, DollarSign, Utensils } from 'lucide-react';

import RoomManager from '../../rooms/components/RoomManager';
import GuestManager from '../../guests/components/GuestManager';
import BookingManager from '../../bookings/components/BookingManager';
import KitchenOrders from '../../orders/components/KitchenOrders';
import MenuManager from '../../menu/components/MenuManager';
import BillingManager from '../../billing/components/BillingDashboard';
import DashboardStats from '../components/DashboardStats';
import { LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-blue-600">Laxmi Jawahar Homestay</h2>
                    <p className="text-sm text-gray-500 mt-2">Welcome, {user?.name}</p>
                </div>
                <nav className="mt-6">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Home size={20} />} label="Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
                    <NavItem icon={<Users size={20} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <NavItem icon={<Users size={20} />} label="Guests" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
                    <NavItem icon={<Utensils size={20} />} label="Menu" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                    <NavItem icon={<Coffee size={20} />} label="Kitchen" active={activeTab === 'kitchen'} onClick={() => setActiveTab('kitchen')} />
                    {user?.role === 'OWNER' && (
                        <NavItem icon={<DollarSign size={20} />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                    )}
                    <button onClick={logout} className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition">
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Management</h1>
                </header>

                {activeTab === 'dashboard' && <DashboardStats />}
                {activeTab === 'rooms' && <RoomManager />}
                {activeTab === 'bookings' && <BookingManager />}
                {activeTab === 'guests' && <GuestManager />}
                {activeTab === 'menu' && <MenuManager />}
                {activeTab === 'kitchen' && <KitchenOrders />}
                {activeTab === 'billing' && <BillingManager />}
            </div>
        </div>
    );
};





const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-6 py-3 transition ${active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
    >
        <div className="mr-3">{icon}</div>
        <span className="font-medium">{label}</span>
    </button>
);





export default AdminDashboard;
