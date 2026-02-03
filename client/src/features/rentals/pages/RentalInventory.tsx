import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

interface RentalItem {
    id?: number;
    name: string;
    category: string;
    description?: string;
    price: number;
    totalQty: number;
    available?: boolean;
    image?: string;
}

const RentalInventory = () => {
    const [items, setItems] = useState<RentalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<RentalItem>({
        name: '', category: 'Furniture', description: '', price: 0, totalQty: 1, image: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/api/rentals/items');
            setItems(res.data);
        } catch (err) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing && formData.id) {
                await axios.put(`/api/rentals/items/${formData.id}`, formData);
                toast.success('Item updated');
            } else {
                await axios.post('/api/rentals/items', formData);
                toast.success('Item added');
            }
            setShowModal(false);
            fetchItems();
            resetForm();
        } catch (err) {
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        setSubmitting(true);
        try {
            await axios.delete(`/api/rentals/items/${id}`);
            toast.success('Item deleted');
            fetchItems();
        } catch (err) {
            toast.error('Failed to delete (Item might be in use)');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', category: 'Furniture', description: '', price: 0, totalQty: 1, image: '' });
        setIsEditing(false);
    };

    const openEdit = (item: RentalItem) => {
        setFormData(item);
        setIsEditing(true);
        setShowModal(true);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Inventory Items</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
                        <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package size={48} className="text-gray-300" />
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-lg shadow-sm">
                                <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                                    <p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-full">{item.category}</p>
                                </div>
                                <p className="font-bold text-blue-600">₹{item.price}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mt-4 border-t pt-3 border-dashed">
                                <span>Total Stock:</span>
                                <span className="font-mono font-bold">{item.totalQty}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Item Name</label>
                                    <input
                                        required
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Category</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Furniture">Furniture</option>
                                        <option value="Utensils">Utensils</option>
                                        <option value="Tents">Tents</option>
                                        <option value="Decor">Decor</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Price (per unit)</label>
                                    <input
                                        type="number" min="0" required
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Total Quantity</label>
                                    <input
                                        type="number" min="1" required
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.totalQty}
                                        onChange={e => setFormData({ ...formData, totalQty: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Image URL</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.image || ''}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
                                    {submitting ? <Loader size={16} color="#ffffff" /> : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalInventory;
