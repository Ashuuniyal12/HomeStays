import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BillView = ({ bookingId, isAdmin = false, onCheckout, readonly = false, isProcessing = false }: { bookingId: string, isAdmin?: boolean, onCheckout?: () => void, readonly?: boolean, isProcessing?: boolean }) => {
    const [bill, setBill] = useState<any>(null);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const res = await axios.get(`/api/bookings/${bookingId}/bill`);
                setBill(res.data);
            } catch (error) {
                console.error("Failed to fetch bill", error);
            }
        };

        fetchBill();

        const socket = io();
        socket.on(`order:${bookingId}`, () => {
            fetchBill();
        });

        return () => {
            socket.disconnect();
        };
    }, [bookingId]);

    if (!bill) return <div className="p-4">Loading Bill...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-center font-bold text-xl mb-4 border-b pb-2">
                {isAdmin ? 'Final Bill Settlement' : 'Provisional Bill'}
            </h2>

            <div className="flex justify-between">
                <span>Room Charges ({bill.breakdown.days} days)</span>
                <span>₹{bill.roomTotal}</span>
            </div>

            {/* Food Breakup */}
            <div className="border-t border-b py-2 my-2">
                <div className="flex justify-between font-medium mb-2">
                    <span>Food & Beverages</span>
                    <span>₹{bill.foodTotal}</span>
                </div>
                {bill.breakdown.foodItems && bill.breakdown.foodItems.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto bg-gray-50 p-2 rounded text-sm space-y-4 custom-scrollbar">
                        {Object.entries(
                            bill.breakdown.foodItems.reduce((groups: any, item: any) => {
                                const date = new Date(item.orderDate).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                });
                                if (!groups[date]) groups[date] = [];
                                groups[date].push(item);
                                return groups;
                            }, {})
                        ).map(([date, items]: [string, any]) => (
                            <div key={date}>
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    {date}
                                </h4>
                                <div className="space-y-1.5 pl-2 border-l-2 border-gray-200">
                                    {(items as any[]).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-gray-700">
                                            <span>
                                                {item.name}
                                                <span className="text-gray-400 text-xs ml-1">x{item.quantity}</span>
                                            </span>
                                            <span className="font-medium">₹{item.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-center text-gray-400 italic">No food items ordered</p>
                )}
            </div>



            <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                    <span>Grand Total</span>
                    <span>₹{bill.grandTotal?.toFixed(2)}</span>
                </div>
                {bill.paidAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                        <span>Advance Paid</span>
                        <span>-₹{bill.paidAmount?.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                    <span>Remaining Payable</span>
                    <span className="text-blue-600">₹{bill.remainingAmount?.toFixed(2)}</span>
                </div>
            </div>

            {isAdmin && !readonly ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onCheckout) onCheckout();
                    }}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-bold mt-6 transition-colors flex justify-center items-center gap-2
                        ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {isProcessing ? 'Processing Checkout...' : 'Confirm Payment & Checkout'}
                </button>
            ) : isAdmin && readonly ? (
                <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-bold mt-6 text-center border">
                    Bill Settled (Read Only)
                </div>
            ) : (
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-6 opacity-50 cursor-not-allowed">
                    Request Checkout (Visit Desk)
                </button>
            )}
        </div>
    );
};


export default BillView;
