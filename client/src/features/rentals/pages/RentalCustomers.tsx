import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, User, Phone, MapPin, Eye, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../../../utils/Loader';

interface RentalCustomer {
    id: string;
    name: string;
    phoneNumber: string;
    address?: string;
    email?: string;
    idProof?: string;
    createdAt: string;
}

interface RentalOrder {
    id: string;
    status: string;
    eventDate: string;
    returnDate?: string;
    totalAmount: number;
    paidAmount: number;
    items: any[];
}

const RentalCustomers = () => {
    const [customers, setCustomers] = useState<RentalCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState<RentalCustomer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<RentalOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('/api/rentals/customers');
            setCustomers(res.data);
        } catch (err) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        // You could optimize this with debounce, but for now simple matches locally or API
        try {
            const endpoint = term ? `/api/rentals/customers/search?q=${term}` : '/api/rentals/customers';
            const res = await axios.get(endpoint);
            setCustomers(res.data);
        } catch (err) {
            // silent fail or toast
        }
    };

    const openCustomerDetails = async (customer: RentalCustomer) => {
        setSelectedCustomer(customer);
        setOrdersLoading(true);
        try {
            const res = await axios.get(`/api/rentals/orders?customerId=${customer.id}`);
            setCustomerOrders(res.data);
        } catch (err) {
            toast.error('Failed to load customer history');
        } finally {
            setOrdersLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedCustomer(null);
        setCustomerOrders([]);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader /></div>;

    return (
        <div>
            {/* Header / Search */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Rental Customers</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers Grid/List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr key={customer.id} onClick={() => openCustomerDetails(customer)} className="hover:bg-gray-50 transition cursor-pointer group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <User size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                {customer.idProof && <div className="text-xs text-gray-500">ID: {customer.idProof}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Phone size={14} className="mr-1 text-gray-400" />
                                                {customer.phoneNumber}
                                            </div>
                                            {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {customer.address || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openCustomerDetails(customer); }}
                                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 ml-auto group-hover:scale-105 transition-transform"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {customers.map((customer) => (
                        <div key={customer.id} onClick={() => openCustomerDetails(customer)} className="p-4 active:bg-gray-50 transition cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mt-1">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold text-gray-900">{customer.name}</h3>
                                        <span className="text-xs text-gray-400">{new Date(customer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                                        <Phone size={12} className="text-gray-400" />
                                        {customer.phoneNumber}
                                    </p>
                                    {customer.address && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            {customer.address}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-shrink-0 self-center">
                                    <div className="p-2 text-gray-300">
                                        <Eye size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {customers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No customers found.
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-4xl h-full sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{selectedCustomer.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedCustomer.phoneNumber}</p>
                                </div>
                            </div>
                            <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition">
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Profile Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Contact Info</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomer.phoneNumber}</p>
                                    <p className="text-sm text-gray-600">{selectedCustomer.email || 'No email'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Address</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-700">{selectedCustomer.address || 'No address provided'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Details</p>
                                    <p className="text-sm"><span className="text-gray-500 block text-xs">ID Proof</span> {selectedCustomer.idProof || '-'}</p>
                                    <p className="text-sm mt-2"><span className="text-gray-500 block text-xs">Joined</span> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Order History */}
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600" />
                                Order History
                            </h4>

                            {ordersLoading ? (
                                <div className="flex justify-center py-8"><Loader /></div>
                            ) : customerOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {customerOrders.map(order => (
                                        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full 
                                                            ${order.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'OUT' ? 'bg-amber-100 text-amber-700' :
                                                                    order.status === 'RETURNED' ? 'bg-green-100 text-green-700' :
                                                                        'bg-gray-100 text-gray-700'}`}>
                                                            {order.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
                                                    </div>
                                                    <p className="text-sm font-medium">
                                                        {new Date(order.eventDate).toLocaleDateString()}
                                                        {order.returnDate && ` - ${new Date(order.returnDate).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                                                    <p className="text-xs text-green-600">Paid: ₹{order.paidAmount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                                    <p className="text-gray-500">No orders found for this customer.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={closeDetails} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalCustomers;
