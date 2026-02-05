import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Search, Eye, Filter, Calendar, MapPin, CheckCircle, Clock, Truck } from 'lucide-react';
import Loader from '../../../utils/Loader';

const RentalOrders = ({ openOrder: propOpenOrder }: { openOrder?: (id: number) => void }) => {
    const context = useOutletContext<{ openOrder: (id: number) => void } | null>();
    const openOrder = propOpenOrder || context?.openOrder;

    if (!openOrder) {
        // Fallback or just warn, but prevent crash
        console.warn('RentalOrders: openOrder function not provided via props or context');
    }
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const endpoint = statusFilter === 'ALL'
                ? '/api/rentals/orders'
                : `/api/rentals/orders?status=${statusFilter}`;
            const res = await axios.get(endpoint);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            BOOKED: 'bg-blue-100 text-blue-700 border-blue-200',
            OUT: 'bg-orange-100 text-orange-700 border-orange-200',
            RETURNED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-50 text-red-600 border-red-100'
        };
        const icons: any = {
            BOOKED: <Calendar size={12} />,
            OUT: <Truck size={12} />,
            RETURNED: <CheckCircle size={12} />,
            CANCELLED: <Clock size={12} />
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.BOOKED}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-gray-800">Rental Orders</h2>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['ALL', 'BOOKED', 'OUT', 'RETURNED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === s
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader /></div>
            ) : orders.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No orders found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Date Box */}
                                <div className="flex-shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-0 bg-gray-50 rounded-lg p-3 min-w-[100px] border border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Event Date</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {new Date(order.eventDate).getDate()}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                        {new Date(order.eventDate).toLocaleString('default', { month: 'short' })}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{order.customer?.name}</h3>
                                            <p className="text-sm text-gray-500">{order.customer?.phoneNumber}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-gray-400" />
                                            {order.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={16} className="text-gray-400" />
                                            Return: {order.returnDate ? new Date(order.returnDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="mt-3 pt-3 border-t border-dashed flex gap-2 overflow-hidden">
                                        {order.items?.map((item: any, idx: number) => (
                                            <span key={idx} className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-600">
                                                {item.quantity}x {item.item?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount & Actions */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Total</p>
                                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>

                                        <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-gray-500">
                                            <span>Adv: ₹{order.advanceAmount}</span>
                                            <span>Sec: ₹{order.securityDeposit}</span>
                                        </div>

                                        <p className={`text-xs font-bold mt-1 ${order.paidAmount >= order.totalAmount ? 'text-green-600' : 'text-orange-500'}`}>
                                            {order.paidAmount >= order.totalAmount ? 'PAID' : `Due: ₹${order.totalAmount - order.paidAmount}`}
                                        </p>
                                    </div>

                                    {/* Link to detail page */}
                                    <button onClick={() => openOrder(order.id)} className="text-sm text-blue-600 font-bold hover:underline mt-2">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RentalOrders;
