
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Calendar, Utensils, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../features/auth/auth.store';

interface NewHallBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = [
    { id: 1, title: 'Guest Details', icon: <User size={18} /> },
    { id: 2, title: 'Event Info', icon: <Calendar size={18} /> },
    { id: 3, title: 'Food Menu', icon: <Utensils size={18} /> },
    { id: 4, title: 'Summary & Pay', icon: <CheckCircle size={18} /> }
];

const NewHallBookingModal = ({ isOpen, onClose, onSuccess }: NewHallBookingModalProps) => {
    const { token } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        guestAddress: '',
        guestEmail: '',
        eventDate: '',
        session: 'FULL_DAY', // MORNING, EVENING, FULL_DAY
        purpose: 'Engagement',
        guestCount: '',
        customMenuItems: [] as { name: string; price: number; quantity: number }[],
        totalAmount: 0,
        advanceAmount: 0
    });

    // Custom Menu Builder State
    const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '' });

    const addMenuItem = () => {
        if (!newItem.name || !newItem.price || !newItem.quantity) return;
        setFormData(prev => ({
            ...prev,
            customMenuItems: [...prev.customMenuItems, {
                name: newItem.name,
                price: parseFloat(newItem.price),
                quantity: parseInt(newItem.quantity)
            }]
        }));
        setNewItem({ name: '', price: '', quantity: '' });
    };

    const removeMenuItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            customMenuItems: prev.customMenuItems.filter((_, i) => i !== index)
        }));
    };

    // Auto-calculate Total Amount when menu items change
    useEffect(() => {
        const menuTotal = formData.customMenuItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (menuTotal > 0) {
            setFormData(prev => ({ ...prev, totalAmount: menuTotal }));
        }
    }, [formData.customMenuItems]);

    useEffect(() => {
        // Fetch menu items for selection
        const fetchMenu = async () => {
            try {
                const res = await axios.get('/api/menu', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMenuItems(res.data);
            } catch (err) {
                console.error("Failed to load menu", err);
            }
        };
        fetchMenu();
    }, [token]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.guestName.trim()) return "Guest Name is required";
            if (!formData.guestPhone.trim()) return "Phone Number is required";
            if (formData.guestPhone.replace(/\D/g, '').length < 10) return "Phone number must be at least 10 digits";
            if (formData.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) return "Invalid email format";
        }
        if (currentStep === 2) {
            if (!formData.eventDate) return "Event Date is required";
            if (!formData.guestCount) return "Guest Count is required";
            if (parseInt(formData.guestCount) <= 0) return "Guest count must be greater than 0";
        }
        if (currentStep === 4) {
            if (formData.totalAmount < 0) return "Total amount cannot be negative";
            if (formData.advanceAmount < 0) return "Advance amount cannot be negative";
        }
        return null;
    };

    const handleNext = () => {
        const error = validateStep(step);
        if (error) {
            alert(error); // Using alert as per existing style, or could change to toast if imported
            return;
        }
        setStep(s => Math.min(4, s + 1));
    };

    const handleSubmit = async () => {
        const error = validateStep(4);
        if (error) {
            alert(error);
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/hall/bookings', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            alert('Failed to create booking');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b">
                    <h3 className="text-xl font-bold text-gray-800">New Hall Booking</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
                </div>

                {/* Stepper */}
                <div className="flex justify-between px-8 py-4 bg-gray-50 border-b">
                    {steps.map((s, idx) => (
                        <div key={s.id} className={`flex flex-col items-center gap-1 ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all 
                                ${step >= s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'}
                                ${step === s.id ? 'ring-4 ring-blue-100' : ''}
                            `}>
                                {s.icon}
                            </div>
                            <span className="text-xs font-medium">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Guest Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.guestName}
                                    onChange={e => handleChange('guestName', e.target.value)}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                        value={formData.guestPhone}
                                        onChange={e => handleChange('guestPhone', e.target.value)}
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                        value={formData.guestEmail}
                                        onChange={e => handleChange('guestEmail', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                    rows={3}
                                    value={formData.guestAddress}
                                    onChange={e => handleChange('guestAddress', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                    value={formData.eventDate}
                                    onChange={e => handleChange('eventDate', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Session</label>
                                    <select
                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                        value={formData.session}
                                        onChange={e => handleChange('session', e.target.value)}
                                    >
                                        <option value="MORNING">Morning (8am - 3pm)</option>
                                        <option value="EVENING">Evening (4pm - 11pm)</option>
                                        <option value="FULL_DAY">Full Day</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Purpose</label>
                                    <select
                                        className="mt-1 w-full border rounded-lg px-3 py-2"
                                        value={formData.purpose}
                                        onChange={e => handleChange('purpose', e.target.value)}
                                    >
                                        <option value="Engagement">Engagement</option>
                                        <option value="Birthday">Birthday Party</option>
                                        <option value="Mundan">Mundan Ceremony</option>
                                        <option value="Meeting">Corporate Meeting</option>
                                        <option value="Marriage">Marriage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Guests <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                    value={formData.guestCount}
                                    onChange={e => handleChange('guestCount', e.target.value)}
                                    placeholder="Enter expected count"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                            <div className="border bg-gray-50 p-4 rounded-xl space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 uppercase">Add Custom Item</h4>
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-12 md:col-span-5">
                                        <input
                                            placeholder="Item Name (e.g. Veg Thali)"
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            value={newItem.name}
                                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-3">
                                        <input
                                            placeholder="Price"
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <input
                                            placeholder="Qty"
                                            type="number"
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <button
                                            onClick={addMenuItem}
                                            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-blue-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-500">Menu Items ({formData.customMenuItems.length})</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {formData.customMenuItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white border p-3 rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
                                            </div>
                                            <button onClick={() => removeMenuItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.customMenuItems.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                                            No items added yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50 p-4 rounded-xl border space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Guest</span>
                                    <span className="font-medium">{formData.guestName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Event</span>
                                    <span className="font-medium">{formData.purpose} on {formData.eventDate} ({formData.session})</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Guests</span>
                                    <span className="font-medium">{formData.guestCount} People</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Menu</span>
                                    <span className="font-medium text-right">
                                        {formData.customMenuItems.map((i, idx) => (
                                            <div key={idx}>{i.name} x {i.quantity}</div>
                                        ))}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Amount (Quote) <span className="text-red-500">*</span></label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-7 pr-3 py-2 border rounded-lg font-bold"
                                            value={formData.totalAmount}
                                            onChange={e => handleChange('totalAmount', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Advance Paid</label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-7 pr-3 py-2 border rounded-lg font-bold text-green-600"
                                            value={formData.advanceAmount}
                                            onChange={e => handleChange('advanceAmount', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.totalAmount}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Confirming...' : 'Confirm Booking'} <CheckCircle size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewHallBookingModal;
