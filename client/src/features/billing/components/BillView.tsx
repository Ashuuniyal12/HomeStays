import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BillView = ({ bookingId, isAdmin = false, onCheckout, readonly = false }: { bookingId: string, isAdmin?: boolean, onCheckout?: () => void, readonly?: boolean }) => {
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
            <div className="flex justify-between">
                <span>Food & Beverages</span>
                <span>₹{bill.foodTotal}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
                <span>Tax (5%)</span>
                <span>₹{bill.tax.toFixed(2)}</span>
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center text-xl font-bold">
                <span>Total Pay</span>
                <span className="text-blue-600">₹{bill.grandTotal.toFixed(2)}</span>
            </div>

            {isAdmin && !readonly ? (
                <button
                    onClick={onCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold mt-6 hover:bg-green-700"
                >
                    Confirm Payment & Checkout
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
