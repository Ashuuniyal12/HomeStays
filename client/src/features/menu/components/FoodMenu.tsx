import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

const FoodMenu = ({ bookingId }: { bookingId: string }) => {
    const [menu, setMenu] = useState<any[]>([]);
    const [cart, setCart] = useState<any>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        axios.get('/api/menu').then(res => {
            const data = res.data;
            setMenu(data);
            const cats = Array.from(new Set(data.map((i: any) => i.category))) as string[];
            setCategories(['All', ...cats]);
        });
    }, []);

    const updateCart = (itemId: number, change: number) => {
        setCart((prev: any) => {
            const current = prev[itemId] || 0;
            const newQty = Math.max(0, current + change);
            if (newQty === 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const placeOrder = async () => {
        const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId: parseInt(menuItemId), quantity }));
        if (items.length === 0) return;

        setIsPlacingOrder(true);

        try {
            await axios.post('/api/orders', { bookingId, items });

            // Play confirmation sound
            try {
                const audio = new Audio('/sounds/request-confirmataion.wav');
                audio.play().catch(e => console.log('Audio play blocked:', e));
            } catch (e) {
                console.error('Audio setup failed', e);
            }

            toast.success('Order Placed! The kitchen is preparing your food.');
            setCart({});
        } catch (err) {
            toast.error('Order failed');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const total = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menu.find(i => i.id === parseInt(id));
        return sum + (item ? item.price * (qty as number) : 0);
    }, 0);

    const filteredMenu = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

    return (
        <div className="pb-24">
            {/* Loader Modal */}
            {isPlacingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[60] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={48} className="text-blue-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Placing Your Order</h3>
                        <p className="text-gray-500 text-sm mt-1">Please wait a moment...</p>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenu.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start transition hover:shadow-md">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center mb-1">
                                <span className={`w-4 h-4 rounded-md flex items-center justify-center border mr-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </span>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</div>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.description || 'Delightful dish prepared fresh.'}</p>
                            <div className="mt-3 font-bold text-gray-900">₹{item.price}</div>
                        </div>

                        {item.available ? (
                            <div className="flex flex-col items-end">
                                {cart[item.id] ? (
                                    <div className="flex items-center bg-white border rounded-lg shadow-sm">
                                        <button onClick={() => updateCart(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-lg">-</button>
                                        <span className="w-8 text-center font-bold text-gray-800">{cart[item.id]}</span>
                                        <button onClick={() => updateCart(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-r-lg">+</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => updateCart(item.id, 1)}
                                        className="bg-white text-blue-600 border border-blue-200 px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-50 transition"
                                    >
                                        ADD
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-100 text-gray-400 px-3 py-1 rounded text-xs font-bold uppercase">
                                Sold Out
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Cart Floating Action Button */}
            {total > 0 && (
                <div
                    className={`fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-gray-900 text-white p-4 rounded-xl shadow-2xl z-50 transform transition-all ${isPlacingOrder ? 'cursor-not-allowed opacity-90' : 'hover:scale-105 cursor-pointer'}`}
                    onClick={!isPlacingOrder ? placeOrder : undefined}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-white/20 px-3 py-1 rounded-lg mr-3 font-bold">
                                {Object.keys(cart).length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</span>
                                <span className="font-bold text-xl">₹{total}</span>
                            </div>
                        </div>
                        <div className="flex items-center font-bold text-blue-300">
                            {isPlacingOrder ? (
                                <span className="flex items-center">
                                    <Loader size={20} className="mr-2 animate-spin" /> Placing...
                                </span>
                            ) : (
                                <>Place Order <span className="ml-2">→</span></>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodMenu;
