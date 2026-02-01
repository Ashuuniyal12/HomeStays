import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import Loader from '../../../utils/Loader';

const MenuManager = () => {
    const [items, setItems] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [loadingOp, setLoadingOp] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Snacks',
        price: '',
        isVeg: true,
        available: true
    });

    useEffect(() => { fetchMenu(); }, []);

    const fetchMenu = async () => {
        try {
            const res = await axios.get('/api/menu');
            setItems(res.data);
        } catch (err) { console.error(err); }
    };

    const openModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description || '',
                category: item.category,
                price: item.price,
                isVeg: item.isVeg,
                available: item.available
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', description: '', category: 'Snacks', price: '', isVeg: true, available: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) { toast.error("Item Name is required"); return; }
        if (!formData.category) { toast.error("Category is required"); return; }
        if (parseFloat(formData.price) < 0 || isNaN(parseFloat(formData.price))) { toast.error("Price must be a positive number"); return; }

        setLoadingOp(true);
        try {
            if (editingItem) {
                await axios.patch(`/api/menu/${editingItem.id}`, formData);
                toast.success('Item updated successfully');
            } else {
                await axios.post('/api/menu', formData);
                toast.success('Item added successfully');
            }
            setIsModalOpen(false);
            fetchMenu();
        } catch (err) {
            toast.error('Operation failed');
        } finally {
            setLoadingOp(false);
        }
    };

    const toggleAvailability = async (id: number, currentStatus: boolean) => {
        setLoadingOp(true);
        try {
            await axios.patch(`/api/menu/${id}`, { available: !currentStatus });
            toast.success('Availability updated');
            fetchMenu();
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setLoadingOp(false);
        }
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        setLoadingOp(true);
        try {
            await axios.delete(`/api/menu/${id}`);
            toast.success('Item deleted');
            fetchMenu();
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setLoadingOp(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Operation Loader Modal */}
            {loadingOp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-[70] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                        <Loader size={48} className="text-blue-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Processing...</h3>
                        <p className="text-gray-500 text-sm mt-1">Please wait a moment.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-gray-500 mt-1">Manage your food items, prices, and availability</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    Add New Item
                </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={`relative bg-white p-4 rounded-xl shadow-sm border-l-4 border-y border-r flex justify-between items-start transition hover:shadow-md overflow-hidden ${!item.available ? 'border-gray-200' :
                            item.isVeg ? 'border-l-green-500 border-y-green-100 border-r-green-100' :
                                'border-l-red-500 border-y-red-100 border-r-red-100'
                            }`}
                    >
                        {/* Out of Stock Pattern Overlay */}
                        {!item.available && (
                            <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 1px, transparent 0, transparent 50%)`,
                                    backgroundSize: '10px 10px'
                                }}
                            />
                        )}

                        <div className="flex-1 pr-4 relative z-10">
                            <div className="flex items-center mb-1">
                                <span className={`w-4 h-4 rounded-md flex items-center justify-center border mr-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </span>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</div>
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${!item.available ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.description || 'Delightful dish prepared fresh.'}</p>
                            <div className="mt-3 font-bold text-gray-900">₹{item.price}</div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[120px] relative z-10">
                            {/* Stock Toggle */}
                            <button
                                onClick={() => toggleAvailability(item.id, item.available)}
                                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${item.available
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full mr-2 ${item.available ? 'bg-green-500' : 'bg-yellow-600'}`}></div>
                                {item.available ? 'IN STOCK' : 'OUT STOCK'}
                            </button>

                            {/* Actions */}
                            <div className="flex items-center gap-1 mt-auto">
                                <button
                                    onClick={() => openModal(item)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Item"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-400 text-lg">Your menu is empty.</p>
                    <button onClick={() => openModal()} className="text-blue-600 font-bold mt-2 hover:underline">Add your first item</button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Grilled Chicken Sandwich"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe ingredients, taste, or allergens..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <label className="flex items-center cursor-pointer select-none">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVeg}
                                            onChange={e => setFormData({ ...formData, isVeg: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div className={`w-11 h-6 rounded-full transition-colors ${formData.isVeg ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${formData.isVeg ? 'transform translate-x-5' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">{formData.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                                </label>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition transform active:scale-95"
                                    >
                                        {editingItem ? 'Save Changes' : 'Create Item'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManager;
