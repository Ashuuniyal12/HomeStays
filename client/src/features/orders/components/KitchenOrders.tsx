import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const KitchenOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        // Reset state on mount to prevent stale data
        setOrders([]);
        fetchOrders();

        const socket = io();

        socket.on('order:new', (newOrder: any) => {
            setOrders(prev => {
                // Strict deduplication
                if (prev.some(o => o.id === newOrder.id)) return prev;
                return [newOrder, ...prev];
            });
        });

        return () => {
            socket.off('order:new');
            socket.disconnect();
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`/api/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) { alert('Update failed'); }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                {['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded text-xs ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.filter(o => filter === 'ALL' || o.status === filter).map(order => (
                    <div key={order.id} className={`border rounded-lg p-4 shadow-sm ${order.status === 'PENDING' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold">Room {order.booking?.room?.number}</h4>
                                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded font-bold status-${order.status}`}>
                                {order.status}
                            </span>
                        </div>
                        <ul className="text-sm border-t border-b py-2 my-2 space-y-1">
                            {order.items.map((item: any) => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.quantity}x {item.menuItem?.name}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between items-center mt-3">
                            <span className="font-bold">Total: ₹{order.total}</span>
                            <div className="space-x-2">
                                {order.status === 'PENDING' && <button onClick={() => updateStatus(order.id, 'PREPARING')} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Start Preparing</button>}
                                {order.status === 'PREPARING' && <button onClick={() => updateStatus(order.id, 'READY')} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Mark Ready</button>}
                                {order.status === 'READY' && <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Deliver</button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
        </div>
    );
};

export default KitchenOrders;
