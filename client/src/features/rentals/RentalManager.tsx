import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, PlusCircle } from 'lucide-react';
import RentalDashboard from './pages/RentalDashboard';
import RentalInventory from './pages/RentalInventory';
import RentalOrders from './pages/RentalOrders';
import NewRentalOrder from './pages/NewRentalOrder';
import RentalOrderDetail from './pages/RentalOrderDetail';

const RentalManager = () => {
    const [view, setView] = useState<'DASHBOARD' | 'INVENTORY' | 'ORDERS'>('DASHBOARD');

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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${view === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setView('INVENTORY')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${view === 'INVENTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Package size={16} /> Inventory
                    </button>
                    <button
                        onClick={() => setView('ORDERS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${view === 'ORDERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ShoppingCart size={16} /> Orders
                    </button>
                </div>

                <button
                    onClick={() => setIsNewOrderOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
                >
                    <PlusCircle size={18} /> New Order
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {view === 'DASHBOARD' && <RentalDashboard />}
                {view === 'INVENTORY' && <RentalInventory />}
                {view === 'ORDERS' && <RentalOrders openOrder={setViewOrderId} />}
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
