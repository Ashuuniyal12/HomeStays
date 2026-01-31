import React, { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Utensils, Calendar, User, Download, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

interface HallBillModalProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const HallBillModal: React.FC<HallBillModalProps> = ({ booking, isOpen, onClose, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !booking) return null;

    // Calculate food total
    const foodTotal = booking.menuItems?.reduce((sum: number, item: any) => {
        return sum + (item.menuItem?.price || 0) * (item.quantity || 1);
    }, 0) || 0;

    const rentAmount = booking.totalAmount || 0;
    const extraAmount = booking.extraAmount || 0;
    const grandTotal = rentAmount + foodTotal + extraAmount;
    const advancePaid = booking.advanceAmount || 0;
    const previousPayments = booking.paidAmount || 0;
    const totalPaid = advancePaid + previousPayments;
    const remainingPayable = grandTotal - totalPaid;

    const handleSettle = async () => {
        setIsProcessing(true);
        try {
            await axios.put(`/api/hall/bookings/${booking.id}/payment`, {
                paidAmount: remainingPayable + previousPayments // Storing the total amount paid so far
            });
            toast.success('Bill settled successfully');
            onSuccess();
        } catch (error) {
            console.error('Failed to settle bill', error);
            toast.error('Failed to settle bill');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="text-blue-600" size={24} />
                            Booking Settlement
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Booking ID: {booking.id.substring(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Guest & Event Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Guest</p>
                                <p className="font-bold text-gray-900">{booking.guest?.name}</p>
                                <p className="text-sm text-gray-600">{booking.guest?.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Event Details</p>
                                <p className="font-bold text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600 text-blue-700 capitalize">{booking.session.replace('_', ' ')} • {booking.purpose}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bill Breakdown */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                            Bill Breakdown
                        </h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-gray-700">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    Hall Rent (Fixed)
                                </span>
                                <span className="font-mono font-semibold">₹{rentAmount.toFixed(2)}</span>
                            </div>

                            {extraAmount > 0 && (
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Extra Charges
                                    </span>
                                    <span className="font-mono font-semibold">₹{extraAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Menu Items */}
                            <div className="space-y-2 border-t pt-3">
                                <div className="flex justify-between items-center text-gray-900 font-bold mb-2">
                                    <span className="flex items-center gap-2">
                                        <Utensils size={16} className="text-orange-500" />
                                        Menu & Catering
                                    </span>
                                    <span className="font-mono">₹{foodTotal.toFixed(2)}</span>
                                </div>
                                {booking.menuItems?.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {booking.menuItems.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm text-gray-600">
                                                <span>{item.menuItem?.name} <span className="text-gray-400 text-xs pl-1">x{item.quantity}</span></span>
                                                <span className="font-mono">₹{((item.menuItem?.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic text-center py-2">No menu items selected</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
                        <div className="flex justify-between items-center text-gray-500">
                            <span>Grand Total</span>
                            <span className="font-mono text-lg font-bold text-gray-900">₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600 text-sm">
                            <span>Advance Amount Paid</span>
                            <span className="font-mono">-₹{advancePaid.toFixed(2)}</span>
                        </div>
                        {previousPayments > 0 && (
                            <div className="flex justify-between items-center text-green-600 text-sm">
                                <span>Previous Payments</span>
                                <span className="font-mono">-₹{previousPayments.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total Remaining</span>
                            <span className="text-2xl font-black text-blue-600 font-mono">₹{remainingPayable.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-white transition-all"
                    >
                        Close
                    </button>
                    {booking.status !== 'COMPLETED' ? (
                        <button
                            onClick={handleSettle}
                            disabled={isProcessing || remainingPayable <= 0}
                            className={`flex-[2] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                                ${isProcessing || remainingPayable <= 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'}`}
                        >
                            {isProcessing ? <Loader size={20} className="text-white" /> : <CheckCircle size={20} />}
                            {remainingPayable <= 0 ? 'Fully Settled' : 'Confirm Settlement'}
                        </button>
                    ) : (
                        <div className="flex-[2] py-3 px-4 rounded-xl bg-green-50 text-green-700 font-bold flex items-center justify-center gap-2 border border-green-200">
                            <CheckCircle size={20} />
                            Booking Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HallBillModal;
