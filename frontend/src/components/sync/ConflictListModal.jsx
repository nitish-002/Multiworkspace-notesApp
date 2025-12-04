import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import { X, Clock, User } from 'lucide-react';

const ConflictListModal = ({ notebookId, isOpen, onClose, onSelectConflict }) => {
    const [conflicts, setConflicts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && notebookId) {
            fetchConflicts();
        }
    }, [isOpen, notebookId]);

    const fetchConflicts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/sync/conflicts/?notebook_id=${notebookId}`);
            setConflicts(response.data);
        } catch (error) {
            console.error('Failed to fetch conflicts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Pending Conflicts
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : conflicts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No pending conflicts found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conflicts.map((conflict) => (
                                <div
                                    key={conflict.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => onSelectConflict(conflict)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    User #{conflict.user}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(conflict.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                            Pending
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Conflicting changes on version {conflict.server_version}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default ConflictListModal;
