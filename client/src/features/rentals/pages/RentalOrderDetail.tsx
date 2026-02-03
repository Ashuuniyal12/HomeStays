import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Calendar, User, Phone, Package, CreditCard, CheckCircle, Truck, XCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

interface RentalOrderDetailProps {
    orderId: number;
    onClose: () => void;
}

const RentalOrderDetail: React.FC<RentalOrderDetailProps> = ({ orderId, onClose }) => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>('');

    const [confirmAction, setConfirmAction] = useState<{ status: string; isOpen: boolean }>({ status: '', isOpen: false });

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/rentals/orders/${orderId}`);
            setOrder(res.data);
        } catch (err) {
            toast.error('Failed to load order details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const requestStatusUpdate = (newStatus: string) => {
        setConfirmAction({ status: newStatus, isOpen: true });
    };

    const executeStatusChange = async () => {
        setUpdating(true);
        try {
            const res = await axios.put(`/api/rentals/orders/${orderId}/status`, { status: confirmAction.status });
            setOrder(res.data); // Update the order state with the new status
            toast.success(`Order marked as ${confirmAction.status}`);
            setConfirmAction({ status: '', isOpen: false });
            // onClose(); // Close the modal on success - removed as per original instruction, but keeping the order detail open to see the status change might be better UX.
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const updatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return toast.error('Invalid amount');

        setUpdating(true);
        try {
            const newTotalPaid = (order.paidAmount || 0) + amount;
            if (newTotalPaid > order.totalAmount) {
                if (!confirm(`Warning: Total paid (${newTotalPaid}) exceeds total amount (${order.totalAmount}). Continue?`)) {
                    setUpdating(false); // Reset updating if user cancels
                    return;
                }
            }

            const res = await axios.put(`/api/rentals/orders/${orderId}/payment`, { paidAmount: newTotalPaid });
            setOrder(res.data);
            setPaymentAmount('');
            toast.success('Payment updated');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update payment');
        } finally {
            setUpdating(false);
        }
    };

    if (!orderId) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            BOOKED: 'bg-blue-100 text-blue-700 border-blue-200',
            OUT: 'bg-orange-100 text-orange-700 border-orange-200',
            RETURNED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-50 text-red-600 border-red-100'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.BOOKED}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 relative">

                {/* Confirmation Overlay */}
                {confirmAction.isOpen && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in">
                        <div className="max-w-md w-full text-center space-y-6">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center
                                ${confirmAction.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Change Status?</h3>
                                <p className="text-gray-600">
                                    Are you sure you want to mark this order as <span className="font-bold text-gray-900">{confirmAction.status}</span>?
                                </p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setConfirmAction({ status: '', isOpen: false })}
                                    disabled={updating}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeStatusChange}
                                    disabled={updating}
                                    className={`px-6 py-2 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition
                                        ${confirmAction.status === 'CANCELLED' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {updating ? <Loader size={18} color="#fff" /> : 'Confirm Change'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                                <StatusBadge status={order.status} />
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader size={48} /></div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN - DETAILS */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Customer & Location Map */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                                        <User size={18} /> Customer Details
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Name</p>
                                            <p className="font-bold text-gray-900 text-lg">{order.customer?.name}</p>
                                            <a href={`tel:${order.customer?.phoneNumber}`} className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-1 hover:underline">
                                                <Phone size={14} /> {order.customer?.phoneNumber}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Event Location</p>
                                            <p className="font-medium text-gray-800 flex items-start gap-2">
                                                <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                                {order.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                                        <Calendar size={18} /> Rental Period
                                    </div>
                                    <div className="p-6 flex items-center justify-around text-center">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Event Date</p>
                                            <p className="text-xl font-bold text-gray-900">{new Date(order.eventDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-gray-300 font-light text-3xl">→</div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Return Date</p>
                                            <p className="text-xl font-bold text-gray-900">{order.returnDate ? new Date(order.returnDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                                        <Package size={18} /> Order Items
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="px-6 py-3 font-bold uppercase text-xs">Item</th>
                                                    <th className="px-6 py-3 font-bold uppercase text-xs text-center">Qty</th>
                                                    <th className="px-6 py-3 font-bold uppercase text-xs text-right">Price</th>
                                                    <th className="px-6 py-3 font-bold uppercase text-xs text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {order.items?.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.item?.name}</td>
                                                        <td className="px-6 py-4 text-center font-mono">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right font-mono text-gray-600">₹{item.price}</td>
                                                        <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">₹{item.quantity * item.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-xs">Grand Total</td>
                                                    <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">₹{order.totalAmount}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN - ACTIONS & PAYMENT */}
                            <div className="space-y-6">

                                {/* Status Actions */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <AlertCircle size={18} /> Update Status
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {order.status === 'BOOKED' && (
                                            <>
                                                <button onClick={() => requestStatusUpdate('OUT')} disabled={updating}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-bold transition">
                                                    <Truck size={16} /> Mark as OUT
                                                </button>
                                                <button onClick={() => requestStatusUpdate('CANCELLED')} disabled={updating}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition">
                                                    <XCircle size={16} /> Cancel Order
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'OUT' && (
                                            <button onClick={() => requestStatusUpdate('RETURNED')} disabled={updating}
                                                className="flex items-center justify-center gap-2 w-full py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-bold transition">
                                                <CheckCircle size={16} /> Mark as RETURNED
                                            </button>
                                        )}
                                        {order.status === 'RETURNED' && (
                                            <p className="text-center text-sm text-green-600 font-medium bg-green-50 p-2 rounded-lg">
                                                Order Completed
                                            </p>
                                        )}
                                        {order.status === 'CANCELLED' && (
                                            <p className="text-center text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg">
                                                Order Cancelled
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <CreditCard size={18} /> Payment
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Amount</span>
                                            <span className="font-bold">₹{order.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Paid Amount</span>
                                            <span className="font-bold text-green-600">₹{order.paidAmount}</span>
                                        </div>
                                        <div className="pt-3 border-t flex justify-between">
                                            <span className="text-gray-500 font-bold">Due Amount</span>
                                            <span className={`font-bold text-lg ${order.totalAmount - order.paidAmount > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                                ₹{Math.max(0, order.totalAmount - order.paidAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    <form onSubmit={updatePayment} className="pt-4 border-t border-dashed">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Add Payment</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
                                                placeholder="Amount"
                                                value={paymentAmount}
                                                onChange={e => setPaymentAmount(e.target.value)}
                                            />
                                            <button disabled={updating || !paymentAmount}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                                                Add
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RentalOrderDetail;
