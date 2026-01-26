import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Minus, Search, ShoppingBag, Send } from 'lucide-react';
import Loader from '../../../utils/Loader';
import { toast } from 'react-hot-toast';

interface AdminOrderModalProps {
    bookingId: string;
    roomNumber: string;
    guestName: string;
    onClose: () => void;
}

const AdminOrderModal = ({ bookingId, roomNumber, guestName, onClose }: AdminOrderModalProps) => {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await axios.get('/api/menu');
            // Ensure we only show available items
            setMenuItems(res.data.filter((item: any) => item.available));
        } catch (err) {
            console.error(err);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            const newCart = { ...prev, [id]: next };
            if (next === 0) delete newCart[id];
            return newCart;
        });
    };

    const handleSubmit = async () => {
        const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
            menuItemId: parseInt(menuItemId),
            quantity
        }));

        if (items.length === 0) {
            toast.error('Please select at least one item');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/orders', {
                bookingId,
                items
            });
            toast.success('Order placed successfully');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived state
    const filteredMenu = menuItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find(m => String(m.id) === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Add Food Order</h3>
                        <p className="text-sm text-gray-500">Room {roomNumber} • {guestName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Menu List */}
                    <div className="flex-1 flex flex-col border-r border-gray-100">
                        {/* Search Bar */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Menu Grid */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader size={32} className="text-blue-500" /></div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredMenu.map(item => (
                                        <div key={item.id} className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                                    <span className="text-xs font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">₹{item.price}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed">
                                                {cart[item.id] ? (
                                                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-1 w-full justify-between">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-blue-600 hover:bg-blue-100 transition"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="font-bold text-blue-700 text-sm">{cart[item.id]}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-blue-600 hover:bg-blue-100 transition"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => updateQuantity(String(item.id), 1)}
                                                        className="w-full py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        Add Item
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Cart Summary */}
                    <div className="w-80 bg-white flex flex-col shadow-xl z-10">
                        <div className="p-4 bg-blue-50 border-b border-blue-100">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-blue-600" />
                                Current Order
                            </h4>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {Object.keys(cart).length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Select items from the menu to add them to the order.</p>
                                </div>
                            ) : (
                                Object.entries(cart).map(([id, qty]) => {
                                    const item = menuItems.find(m => String(m.id) === id);
                                    if (!item) return null;
                                    return (
                                        <div key={id} className="flex justify-between items-center py-2 border-b border-dashed last:border-0">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-800">{item.name}</div>
                                                <div className="text-xs text-gray-500">₹{item.price} x {qty}</div>
                                            </div>
                                            <div className="font-bold text-gray-900">₹{item.price * qty}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 space-y-4">
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || cartCount === 0}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-blue-500/30"
                            >
                                {submitting ? <Loader size={18} className="text-white" /> : <Send size={18} />}
                                {submitting ? 'Placing Order...' : `Confirm Order (${cartCount})`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderModal;
