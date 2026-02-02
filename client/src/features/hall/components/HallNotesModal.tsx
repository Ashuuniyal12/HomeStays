import React, { useState, useEffect } from 'react';
import { X, FileText, Save } from 'lucide-react';
import RichTextEditor from '../../../components/RichTextEditor';
import axios from 'axios';
import { useAuth } from '../../../features/auth/auth.store';
import toast from 'react-hot-toast';

interface HallNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string | null;
    initialNotes: any; // Can be JSON string or object
    onSuccess: () => void;
}

const HallNotesModal: React.FC<HallNotesModalProps> = ({ isOpen, onClose, bookingId, initialNotes, onSuccess }) => {
    const { token } = useAuth();
    const [notes, setNotes] = useState<string>(''); // Check if this should be empty string or JSON string
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialNotes) {
            // If initialNotes is object (from Prisma Json), stringify it for the editor
            if (typeof initialNotes === 'object' && initialNotes !== null) {
                setNotes(JSON.stringify(initialNotes));
            } else if (typeof initialNotes === 'string') {
                // If it's a string, try to see if it's JSON or plain text
                try {
                    JSON.parse(initialNotes);
                    setNotes(initialNotes);
                } catch {
                    // It's plain text, wrap it in our schema
                    setNotes(JSON.stringify({ html: initialNotes, text: initialNotes }));
                }
            } else {
                setNotes('');
            }
        } else {
            setNotes('');
        }
    }, [isOpen, initialNotes]);

    const handleSave = async () => {
        if (!bookingId) return;
        setLoading(true);
        try {
            // Helper to parse notes string back to object
            let payloadNotes;
            try {
                payloadNotes = JSON.parse(notes);
            } catch {
                payloadNotes = { html: notes, text: notes };
            }

            await axios.put(`/api/hall/bookings/${bookingId}/notes`,
                { notes: payloadNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Notes saved successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save notes", error);
            toast.error('Failed to save notes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-50 border-b px-5 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        <FileText size={20} className="text-blue-600" />
                        Booking Notes
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Notes & Instructions
                        </label>
                        <RichTextEditor
                            value={notes}
                            onChange={setNotes}
                            placeholder="Type notes here... Use the toolbar for formatting."
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                        <span className="font-bold">Tip:</span> You can use **Bold**, Headings, and Indentation to organize valid requirements or menu preferences.
                    </div>
                </div>

                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition border border-gray-200 hover:border-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Notes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HallNotesModal;
