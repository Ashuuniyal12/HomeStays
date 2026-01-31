
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
        menuItemIds: [] as number[],
        totalAmount: 0,
        advanceAmount: 0
    });

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

    const toggleMenuItem = (id: number) => {
        setFormData(prev => {
            const current = prev.menuItemIds;
            if (current.includes(id)) {
                return { ...prev, menuItemIds: current.filter(itemId => itemId !== id) };
            } else {
                return { ...prev, menuItemIds: [...current, id] };
            }
        });
    };

    const handleSubmit = async () => {
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
                                <label className="block text-sm font-medium text-gray-700">Guest Name</label>
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
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
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
                                <label className="block text-sm font-medium text-gray-700">Event Date</label>
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
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-gray-500 mb-3">Select items for the party menu</p>
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                {menuItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleMenuItem(item.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${formData.menuItemIds.includes(item.id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <div>
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.category} • ₹{item.price}</p>
                                        </div>
                                        {formData.menuItemIds.includes(item.id) && <CheckCircle size={16} className="text-blue-600" />}
                                    </div>
                                ))}
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
                                    <span className="text-gray-500">Menu Items</span>
                                    <span className="font-medium">{formData.menuItemIds.length} items selected</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Amount (Quote)</label>
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
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg disabled:opacity-50 transition"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => Math.min(4, s + 1))}
                            disabled={
                                (step === 1 && !formData.guestName) ||
                                (step === 2 && !formData.eventDate)
                            }
                            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
