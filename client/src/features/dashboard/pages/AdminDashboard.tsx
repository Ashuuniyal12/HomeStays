import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/auth.store';
import { LogOut, Home, Coffee, Users, DollarSign, Utensils, CalendarCheck, BarChart3, Sparkles, Menu, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import RoomManager from '../../rooms/components/RoomManager';
import GuestManager from '../../guests/components/GuestManager';
import BookingManager from '../../bookings/components/BookingManager';
import KitchenOrders from '../../orders/components/KitchenOrders';
import MenuManager from '../../menu/components/MenuManager';
import BillingManager from '../../billing/components/BillingDashboard';
import DashboardStats from '../components/DashboardStats';
import ReportsPage from './ReportsPage';
import HallBookingManager from '../../hall/pages/HallBookingManager';
import RentalManager from '../../rentals/RentalManager';
import { LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    // const navigate = useNavigate(); // Not needed for tab switch
    const [activeTab, setActiveTab] = useState('dashboard');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-20">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-blue-600 text-lg">Laxmi Jawahar</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {user?.name?.[0]}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col animate-slide-in-left">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-800">Menu</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Home size={20} />} label="Rooms" active={activeTab === 'rooms'} onClick={() => { setActiveTab('rooms'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<CalendarCheck size={20} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Users size={20} />} label="Guests" active={activeTab === 'guests'} onClick={() => { setActiveTab('guests'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Utensils size={20} />} label="Menu" active={activeTab === 'menu'} onClick={() => { setActiveTab('menu'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Coffee size={20} />} label="Kitchen" active={activeTab === 'kitchen'} onClick={() => { setActiveTab('kitchen'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Sparkles size={20} />} label="Party Hall" active={activeTab === 'hall'} onClick={() => { setActiveTab('hall'); setIsMobileMenuOpen(false); }} />
                            <NavItem icon={<Package size={20} />} label="Rentals" active={activeTab === 'rentals'} onClick={() => { setActiveTab('rentals'); setIsMobileMenuOpen(false); }} />
                            {user?.role === 'OWNER' && (
                                <>
                                    <div className="pt-4 pb-2">
                                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
                                    </div>
                                    <NavItem icon={<DollarSign size={20} />} label="Billing" active={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setIsMobileMenuOpen(false); }} />
                                    <NavItem icon={<BarChart3 size={20} />} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }} />
                                </>
                            )}
                        </nav>
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {user?.name?.[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalized">{user?.role?.toLowerCase()}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 transition rounded-lg font-medium">
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-white shadow-xl flex-col z-10">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-blue-600">Laxmi Jawahar Homestay</h2>
                    <p className="text-sm text-gray-500 mt-2">Welcome, {user?.name}</p>
                </div>
                <nav className="mt-6 flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Home size={20} />} label="Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
                    <NavItem icon={<CalendarCheck size={20} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <NavItem icon={<Users size={20} />} label="Guests" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
                    <NavItem icon={<Utensils size={20} />} label="Menu" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                    <NavItem icon={<Coffee size={20} />} label="Kitchen" active={activeTab === 'kitchen'} onClick={() => setActiveTab('kitchen')} />
                    <NavItem icon={<Sparkles size={20} />} label="Party Hall" active={activeTab === 'hall'} onClick={() => setActiveTab('hall')} />
                    <NavItem icon={<Package size={20} />} label="Rentals" active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} />
                    {user?.role === 'OWNER' && (
                        <>
                            <NavItem icon={<DollarSign size={20} />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                            <NavItem icon={<BarChart3 size={20} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                        </>
                    )}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={logout} className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition rounded-lg">
                        <LogOut size={20} className="mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 bg-gray-50/50">
                <header className="flex justify-between items-center mb-8">
                    {/* <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Management</h1> */}
                </header>

                {activeTab === 'dashboard' && <DashboardStats navigate={setActiveTab} />}
                {activeTab === 'rooms' && <RoomManager />}
                {activeTab === 'bookings' && <BookingManager />}
                {activeTab === 'guests' && <GuestManager />}
                {activeTab === 'menu' && <MenuManager />}
                {activeTab === 'kitchen' && <KitchenOrders />}
                {activeTab === 'billing' && <BillingManager />}
                {activeTab === 'reports' && <ReportsPage />}
                {activeTab === 'hall' && <HallBookingManager />}
                {activeTab === 'rentals' && <RentalManager />}
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
