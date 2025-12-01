import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CreateNotebookModal = ({ isOpen, onClose, workspaceId, onCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('# New Notebook\n\nStart writing here...');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/api/notebooks/', {
                title,
                content,
                workspace_id: workspaceId
            });
            onCreated();
            onClose();
            setTitle('');
            setContent('# New Notebook\n\nStart writing here...');
        } catch (err) {
            console.error('Failed to create notebook:', err);
            setError('Failed to create notebook. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Create Notebook</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Project Notes"
                        autoFocus
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                            transition duration-200 ease-in-out text-sm font-mono"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNotebookModal;
