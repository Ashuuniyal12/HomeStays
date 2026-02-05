import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, PlusCircle, Users } from 'lucide-react';
import RentalDashboard from './pages/RentalDashboard';
import RentalInventory from './pages/RentalInventory';
import RentalOrders from './pages/RentalOrders';
import NewRentalOrder from './pages/NewRentalOrder';
import RentalOrderDetail from './pages/RentalOrderDetail';
import RentalCustomers from './pages/RentalCustomers';

const RentalManager = () => {
    const [view, setView] = useState<'DASHBOARD' | 'INVENTORY' | 'ORDERS' | 'CUSTOMERS'>('DASHBOARD');

    // Modal States
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [viewOrderId, setViewOrderId] = useState<number | null>(null);

    const handleNewOrderSuccess = (order: any) => {
        setIsNewOrderOpen(false);
        setViewOrderId(order.id);
    };

    return (
        <div className="space-y-6">
            {/* Header / Sub-Nav */}
            {/* Header / Sub-Nav */}
            {/* Header / Sub-Nav */}
            <div className="bg-white p-2 md:p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500 overflow-x-auto md:overflow-visible">
                <div className="flex flex-1 justify-between md:justify-start gap-1 md:gap-2 bg-transparent md:bg-gray-50/50 p-0 md:p-1.5 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${view === 'DASHBOARD' ? 'bg-blue-50 md:bg-white text-blue-600 shadow-none md:shadow-sm ring-0 md:ring-1 md:ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                    >
                        <LayoutDashboard size={18} className="md:w-4 md:h-4" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setView('INVENTORY')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${view === 'INVENTORY' ? 'bg-blue-50 md:bg-white text-blue-600 shadow-none md:shadow-sm ring-0 md:ring-1 md:ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                    >
                        <Package size={18} className="md:w-4 md:h-4" />
                        <span>Inventory</span>
                    </button>
                    <button
                        onClick={() => setView('ORDERS')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${view === 'ORDERS' ? 'bg-blue-50 md:bg-white text-blue-600 shadow-none md:shadow-sm ring-0 md:ring-1 md:ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                    >
                        <ShoppingCart size={18} className="md:w-4 md:h-4" />
                        <span>Orders</span>
                    </button>
                    <button
                        onClick={() => setView('CUSTOMERS')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-2 md:px-4 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none ${view === 'CUSTOMERS' ? 'bg-blue-50 md:bg-white text-blue-600 shadow-none md:shadow-sm ring-0 md:ring-1 md:ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                    >
                        <Users size={18} className="md:w-4 md:h-4" />
                        <span>Customers</span>
                    </button>
                </div>

                <div className="w-px h-8 bg-gray-200 block md:hidden mx-1"></div>

                <button
                    onClick={() => setIsNewOrderOpen(true)}
                    className="bg-blue-600 text-white p-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-sm font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 whitespace-nowrap active:scale-95 duration-200 min-w-[60px] md:min-w-0"
                >
                    <PlusCircle size={20} className="md:w-4.5 md:h-4.5" />
                    <span>New</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {view === 'DASHBOARD' && <RentalDashboard />}
                {view === 'INVENTORY' && <RentalInventory />}
                {view === 'ORDERS' && <RentalOrders openOrder={setViewOrderId} />}
                {view === 'CUSTOMERS' && <RentalCustomers />}
            </div>

            {/* Modals */}
            {isNewOrderOpen && (
                <NewRentalOrder
                    onClose={() => setIsNewOrderOpen(false)}
                    onSuccess={handleNewOrderSuccess}
                />
            )}

            {viewOrderId && (
                <RentalOrderDetail
                    orderId={viewOrderId}
                    onClose={() => setViewOrderId(null)}
                />
            )}
        </div>
    );
};

export default RentalManager;
