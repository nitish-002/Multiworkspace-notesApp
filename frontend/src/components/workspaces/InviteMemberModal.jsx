import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import Input from '../ui/Input';
import Button from '../ui/Button';

const InviteMemberModal = ({ isOpen, onClose, workspaceId, onInvited }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('EDITOR');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post(`/api/workspaces/${workspaceId}/members/add/`, {
                email,
                role
            });
            onInvited();
            onClose();
            setEmail('');
            setRole('EDITOR');
        } catch (err) {
            console.error('Failed to invite member:', err);
            setError(err.response?.data?.detail || 'Failed to invite member. Please check the email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Invite Member</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="colleague@example.com"
                        autoFocus
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                            transition duration-200 ease-in-out"
                        >
                            <option value="VIEWER">Viewer (Read only)</option>
                            <option value="EDITOR">Editor (Can edit notebooks)</option>
                            <option value="ADMIN">Admin (Can manage members)</option>
                        </select>
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
                            Invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;
