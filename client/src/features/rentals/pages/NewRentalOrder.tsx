import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Calendar, Save, Trash2, X, Check, ChevronRight, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

// Types (simplified for this component)
interface RentalCustomer {
    id: number;
    name: string;
    phoneNumber: string;
    address: string;
    idProof?: string;
}

interface RentalItem {
    id: number;
    name: string;
    totalQty: number;
    availableQty: number;
    price: number;
}

interface OrderItem {
    id: number; // rentalItemId
    name: string;
    price: number;
    quantity: number;
}

interface NewRentalOrderProps {
    onClose: () => void;
    onSuccess: (order: any) => void;
}

const NewRentalOrder: React.FC<NewRentalOrderProps> = ({ onClose, onSuccess }) => {
    // Stage 1: Customer Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<RentalCustomer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<RentalCustomer | null>(null);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

    // New Customer Form
    const [newCustomer, setNewCustomer] = useState({ name: '', phoneNumber: '', address: '', idProof: '' });

    // Stage 2: Order Details & Items
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState('');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [availableItems, setAvailableItems] = useState<RentalItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    // Payment
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [securityDeposit, setSecurityDeposit] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);


    // Search Customers
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.length > 2) {
                try {
                    const res = await axios.get(`/api/rentals/customers/search?q=${searchTerm}`);
                    setCustomers(res.data);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setCustomers([]);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phoneNumber) return toast.error('Name & Phone required');
        setIsSubmitting(true);
        try {
            const res = await axios.post('/api/rentals/customers', newCustomer);
            setSelectedCustomer(res.data);
            setShowNewCustomerForm(false);
            toast.success('Customer created');
        } catch (err) {
            toast.error('Failed to create customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check Availability
    const checkAvailability = async () => {
        if (!eventDate) return;
        setIsChecking(true);
        try {
            const res = await axios.get('/api/rentals/items/availability', {
                params: { eventDate, returnDate }
            });
            setAvailableItems(res.data);
        } catch (err) {
            toast.error('Failed to fetch item availability');
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkAvailability();
    }, [eventDate, returnDate]);

    // Add Item to Order
    const addItem = (item: RentalItem) => {
        const existing = orderItems.find(i => i.id === item.id);
        if (existing) {
            if (existing.quantity >= item.availableQty) return toast.error('Max available quantity reached');
            setOrderItems(orderItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setOrderItems([...orderItems, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const removeItem = (id: number) => {
        setOrderItems(orderItems.filter(i => i.id !== id));
    };

    const updateQty = (id: number, delta: number) => {
        setOrderItems(orderItems.map(i => {
            if (i.id === id) {
                const itemRef = availableItems.find(ai => ai.id === id);
                const newQty = Math.max(1, i.quantity + delta);
                if (itemRef && newQty > itemRef.availableQty) {
                    toast.error(`Only ${itemRef.availableQty} available`);
                    return i;
                }
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    // Submit Order
    const handleSubmitOrder = async () => {
        if (!selectedCustomer) return toast.error('Select a customer');
        if (orderItems.length === 0) return toast.error('Add items to order');
        if (!location) return toast.error('Event location required');

        setIsSubmitting(true);
        try {
            const payload = {
                customerId: selectedCustomer.id,
                eventDate,
                returnDate: returnDate || undefined,
                location,
                items: orderItems.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
                advanceAmount: advanceAmount ? parseFloat(advanceAmount) : 0,
                securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
                notes
            };

            const res = await axios.post('/api/rentals/orders', payload);
            toast.success('Rental Order Created!');
            onSuccess(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create order');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculations
    const totalAmount = orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const balance = totalAmount - (advanceAmount ? parseFloat(advanceAmount) : 0);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-300/50 text-blue-600 flex-shrink-0">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Plus size={24} /> New Rental Order
                    </h1>
                    <button onClick={onClose} className="p-2 hover:bg-red-400 rounded-full text-red-600/80 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* LEFT PANEL: CONFIGURATION */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 border-r border-gray-200">

                        {/* 1. CUSTOMER SELECT */}
                        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</div>
                                Customer Details
                            </h2>

                            {selectedCustomer ? (
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                                        <p className="text-sm text-gray-600">{selectedCustomer.phoneNumber}</p>
                                        <p className="text-xs text-gray-500 mt-1">{selectedCustomer.address}</p>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Change</button>
                                </div>
                            ) : (
                                <>
                                    {!showNewCustomerForm ? (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search customer by name or phone..."
                                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            {customers.length > 0 && (
                                                <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                                                    {customers.map(c => (
                                                        <div key={c.id} onClick={() => setSelectedCustomer(c)}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                                                            <div>
                                                                <p className="font-bold text-gray-800">{c.name}</p>
                                                                <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                                                            </div>
                                                            <ChevronRight size={16} className="text-gray-300" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="text-center pt-2">
                                                <button onClick={() => setShowNewCustomerForm(true)} className="text-blue-600 font-bold text-sm hover:underline">
                                                    + Create New Customer
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input placeholder="Full Name" className="border p-2 rounded"
                                                    value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                                                <input placeholder="Phone Number" className="border p-2 rounded"
                                                    value={newCustomer.phoneNumber} onChange={e => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })} />
                                            </div>
                                            <input placeholder="Address" className="border p-2 rounded w-full"
                                                value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button onClick={() => setShowNewCustomerForm(false)} className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded">Cancel</button>
                                                <button onClick={handleCreateCustomer} disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-1 rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                                                    {isSubmitting ? <Loader size={16} color="#ffffff" /> : 'Save & Continue'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 2. DATES & LOCATION */}
                        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</div>
                                Event Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Date</label>
                                    <input type="date" className="w-full border p-2 rounded-lg"
                                        value={eventDate} onChange={e => setEventDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Return Date (Optional)</label>
                                    <input type="date" className="w-full border p-2 rounded-lg"
                                        value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Location / Delivery Address</label>
                                <input type="text" className="w-full border p-2 rounded-lg"
                                    placeholder="e.g., Community Hall, Sector 4..."
                                    value={location} onChange={e => setLocation(e.target.value)} />
                            </div>
                        </div>

                        {/* 3. ITEMS */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-20 lg:mb-0">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</div>
                                    Select Items
                                </h2>
                                {isChecking && <Loader size={16} className="ml-2 text-blue-600" />}
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {availableItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition group">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">Stock: {item.availableQty} / {item.totalQty}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-sm text-gray-600">₹{item.price}</span>
                                            <button
                                                onClick={() => addItem(item)}
                                                disabled={item.availableQty === 0}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition disabled:opacity-50 disabled:hover:bg-blue-50 disabled:hover:text-blue-600"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: ORDER SUMMARY */}
                    <div className="w-full lg:w-[400px] bg-white border-l shadow-xl flex flex-col z-20">
                        <div className="p-6 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">Order Summary</h3>
                            <p className="text-sm text-gray-500">Review items and payments</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {orderItems.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                                    <p>No items added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orderItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 bg-gray-100 rounded hover:bg-gray-200">-</button>
                                                    <span className="font-mono w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 bg-gray-100 rounded hover:bg-gray-200">+</button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">₹{item.price * item.quantity}</p>
                                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-xs mt-1">Remove</button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="border-t pt-4 mt-4 space-y-2">
                                        <div className="flex justify-between text-base">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-bold">₹{totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Inputs */}
                            <div className="space-y-3 pt-4 border-t">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Advance Paid</label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2 text-gray-400">₹</span>
                                        <input type="number" className="w-full pl-8 pr-3 py-2 border rounded-lg"
                                            value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Security Deposit</label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2 text-gray-400">₹</span>
                                        <input type="number" className="w-full pl-8 pr-3 py-2 border rounded-lg"
                                            value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Notes</label>
                                    <textarea className="w-full border rounded-lg p-2 mt-1 text-sm h-20"
                                        placeholder="Any special instructions..."
                                        value={notes} onChange={e => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4 text-lg">
                                <span className="font-bold text-gray-700">Balance Due</span>
                                <span className="font-bold text-orange-600 text-xl">₹{balance}</span>
                            </div>
                            <button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50 disabled:scale-100">
                                {isSubmitting ? <Loader size={20} color="#ffffff" /> : (
                                    <>
                                        <Check size={20} /> Confirm Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewRentalOrder;
