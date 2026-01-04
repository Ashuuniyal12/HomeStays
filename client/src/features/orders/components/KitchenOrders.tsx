import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Column configurations
const COLUMNS = [
    { id: 'PENDING', title: 'New Orders', color: 'bg-red-50', borderColor: 'border-red-200', titleColor: 'text-red-700' },
    { id: 'PREPARING', title: 'Preparing', color: 'bg-yellow-50', borderColor: 'border-yellow-200', titleColor: 'text-yellow-700' },
    { id: 'READY', title: 'Ready to Serve', color: 'bg-green-50', borderColor: 'border-green-200', titleColor: 'text-green-700' },
    { id: 'DELIVERED', title: 'Completed', color: 'bg-gray-50', borderColor: 'border-gray-200', titleColor: 'text-gray-600' }
];

interface OrderItem {
    id: number;
    menuItem: { name: string; };
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    booking: { room: { number: string; } };
    createdAt: string;
    status: string;
    items: OrderItem[];
    total: number;
}

const KitchenOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchOrders();
        const socket = io();

        // Listen for new orders
        socket.on('order:new', (newOrder: Order) => {
            // Side effects (Audio/Toast) should be outside state setter
            // Play sound
            try {
                const audio = new Audio('/sounds/oredre-reciebed.wav');
                audio.play().catch(e => console.log('Audio play blocked:', e));
            } catch (e) {
                console.error('Audio setup failed', e);
            }
            toast('New Order Received!', { icon: '🔔', id: `new-order-${newOrder.id}` });

            setOrders(prev => {
                if (prev.some(o => o.id === newOrder.id)) return prev;
                return [newOrder, ...prev];
            });
        });

        // Listen for status updates (if another admin updates)
        socket.on('order:update', (updated: Order) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        });

        return () => {
            socket.off('order:new');
            socket.off('order:update');
            socket.disconnect();
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
        } catch (err) { console.error('Failed to fetch orders', err); }
    };

    const updateStatus = async (id: string, nextStatus: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));

            await axios.patch(`/api/orders/${id}/status`, { status: nextStatus });
        } catch (err) {
            toast.error('Failed to update status');
            fetchOrders(); // Revert on fail
        }
    };

    const getNextStatus = (current: string) => {
        if (current === 'PENDING') return 'PREPARING';
        if (current === 'PREPARING') return 'READY';
        if (current === 'READY') return 'DELIVERED';
        return null;
    };

    const renderCard = (order: Order) => {
        const nextStatus = getNextStatus(order.status);
        const timeAgo = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);

        return (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 animate-fade-in hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-gray-800">Room {order.booking?.room?.number}</span>
                    <span className="text-xs font-mono text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-100 py-2 my-2 space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700"><span className="font-bold">{item.quantity}x</span> {item.menuItem?.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-medium text-gray-400">{timeAgo} mins ago</span>
                    {nextStatus && (
                        <button
                            onClick={() => updateStatus(order.id, nextStatus)}
                            className={`px-3 py-1.5 rounded text-xs font-bold text-white shadow-sm transition-transform active:scale-95
                                ${order.status === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                    order.status === 'PREPARING' ? 'bg-blue-500 hover:bg-blue-600' :
                                        'bg-green-500 hover:bg-green-600'}`}
                        >
                            {order.status === 'PENDING' ? 'Start Cooking' :
                                order.status === 'PREPARING' ? 'Mark Ready' : 'Deliver'} &rarr;
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-500">
                    Auto-refreshing • {orders.length} Active Orders
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {COLUMNS.map(col => {
                        const colOrders = orders.filter(o => o.status === col.id);
                        return (
                            <div key={col.id} className={`flex-1 flex flex-col min-w-[280px] rounded-xl ${col.color} border ${col.borderColor}`}>
                                {/* Column Header */}
                                <div className={`p-4 border-b ${col.borderColor} flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10`}>
                                    <h3 className={`font-bold ${col.titleColor}`}>{col.title}</h3>
                                    <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                        {colOrders.length}
                                    </span>
                                </div>

                                {/* Orders List */}
                                <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
                                    {colOrders.length === 0 ? (
                                        <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic">
                                            No orders
                                        </div>
                                    ) : (
                                        colOrders.map(order => renderCard(order))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default KitchenOrders;
