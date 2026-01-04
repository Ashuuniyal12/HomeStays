import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Edit2, Plus, Trash2, X } from 'lucide-react';

const MenuManager = () => {
    const [items, setItems] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
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
        } catch (err) { toast.error('Operation failed'); }
    };

    const toggleAvailability = async (id: number, currentStatus: boolean) => {
        try {
            await axios.patch(`/api/menu/${id}`, { available: !currentStatus });
            toast.success('Availability updated');
            fetchMenu();
        } catch (err) { toast.error('Update failed'); }
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await axios.delete(`/api/menu/${id}`);
            toast.success('Item deleted');
            fetchMenu();
        } catch (err) { toast.error('Delete failed'); }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${!item.available ? 'opacity-70' : ''}`}>
                        <div className={`h-1 w-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 leading-tight">{item.name}</h4>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.category}</span>
                                </div>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-sm">₹{item.price}</span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{item.description || 'No description provided.'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleAvailability(item.id, item.available)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${item.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {item.available ? '● In Stock' : '○ Out of Stock'}
                                </button>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
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
