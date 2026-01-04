import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChefHat, CheckCircle, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface OrderHistoryProps {
    bookingId: string;
    filter?: 'active' | 'history';
}

const OrderHistory = ({ bookingId }: { bookingId: string }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const ordersRef = useRef(orders);

    // Keep ref in sync
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`/api/orders/my-orders?bookingId=${bookingId}`);
                setOrders(res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const socket = io();
        socket.on(`order:${bookingId}`, (updatedOrder: any) => {
            const currentOrders = ordersRef.current;
            const exists = currentOrders.find(o => o.id === updatedOrder.id);

            // Side effects
            if (exists && exists.status !== updatedOrder.status) {
                try {
                    const audio = new Audio('/sounds/oredre-reciebed.wav');
                    audio.play().catch(e => console.log('Audio play blocked:', e));
                } catch (e) { console.error(e); }
                toast.success(`Order Status Updated: ${updatedOrder.status}`, { id: `order-update-${updatedOrder.id}-${updatedOrder.status}` });
            }

            setOrders(prev => {
                let newOrders;
                if (prev.some(o => o.id === updatedOrder.id)) {
                    newOrders = prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                } else {
                    newOrders = [updatedOrder, ...prev];
                }
                return newOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
        });

        return () => {
            socket.off(`order:${bookingId}`);
            socket.disconnect();
        };
    }, [bookingId]);

    if (loading) return <div className="p-4 text-center text-gray-400">Loading orders...</div>;

    const activeOrders = orders.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status));
    const historyOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 opacity-60">
                <ChefHat size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-bold text-gray-400">No Orders Yet</p>
                <p className="text-gray-400">Hungry? Check out our menu!</p>
            </div>
        );
    }

    const OrderCard = ({ order, isActive }: { order: any, isActive?: boolean }) => (
        <div className={`border rounded-xl p-4 shadow-sm transition-shadow ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? <Clock size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">Order #{order.id.slice(0, 6).toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'READY' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-500'
                    }`}>
                    {order.status}
                </div>
            </div>

            <div className="space-y-2 mb-3 pl-12">
                {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{item.quantity} x {item.menuItem?.name}</span>
                        <span className="text-gray-500">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="border-t pt-3 flex justify-between items-center pl-12">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="font-bold text-lg text-gray-800">₹{order.total}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {activeOrders.length > 0 && (
                <div className="animate-in slide-in-from-top duration-500">
                    <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        Live Orders
                    </h3>
                    <div className="space-y-4">
                        {activeOrders.map(order => <OrderCard key={order.id} order={order} isActive={true} />)}
                    </div>
                </div>
            )}

            {historyOrders.length > 0 && (
                <div>
                    {activeOrders.length > 0 && <hr className="my-8 border-gray-200" />}
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Order History</h3>
                    <div className="space-y-4 opacity-75 grayscale-[30%] hover:grayscale-0 transition-all">
                        {historyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
