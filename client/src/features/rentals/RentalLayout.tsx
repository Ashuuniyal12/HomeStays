import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, PlusCircle, ArrowLeft } from 'lucide-react';
import NewRentalOrder from './pages/NewRentalOrder';
import RentalOrderDetail from './pages/RentalOrderDetail';

const RentalLayout = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    // Modal States
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [viewOrderId, setViewOrderId] = useState<number | null>(null);

    const handleNewOrderSuccess = (order: any) => {
        setIsNewOrderOpen(false);   // Close "New Order"
        setViewOrderId(order.id);   // Immediately open "Order Details"
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Rental Management</h1>
                                <p className="text-xs text-gray-500 font-medium">Outside Events & Equipment</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsNewOrderOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                            <PlusCircle size={18} />
                            <span className="hidden sm:inline">New Order</span>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-2 overflow-x-auto no-scrollbar">
                        <Link
                            to="/admin/rentals"
                            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${isActive('/admin/rentals')
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/rentals/orders"
                            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${isActive('/admin/rentals/orders')
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <ShoppingCart size={18} />
                            Orders
                        </Link>
                        <Link
                            to="/admin/rentals/inventory"
                            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${isActive('/admin/rentals/inventory')
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Package size={18} />
                            Inventory
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Pass openOrder function to children */}
                <Outlet context={{ openOrder: setViewOrderId }} />
            </main>

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

export default RentalLayout;
