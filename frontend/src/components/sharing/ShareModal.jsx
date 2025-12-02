import React, { useState, useEffect } from 'react';
import { X, Copy, Trash2, Globe, Lock, Clock, Plus } from 'lucide-react';
import { sharingApi } from '../../api/axios';
import Button from '../ui/Button';

const ShareModal = ({ isOpen, onClose, notebookId }) => {
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newLinkData, setNewLinkData] = useState({
        access_level: 'READ',
        expires_at: '',
        password: '',
        max_uses: ''
    });

    useEffect(() => {
        if (isOpen && notebookId) {
            fetchLinks();
        }
    }, [isOpen, notebookId]);

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const response = await sharingApi.list(notebookId);
            setLinks(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch share links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLink = async () => {
        try {
            const payload = {
                notebook: notebookId,
                access_level: newLinkData.access_level,
                ...(newLinkData.expires_at && { expires_at: newLinkData.expires_at }),
                ...(newLinkData.password && { password: newLinkData.password }),
                ...(newLinkData.max_uses && { max_uses: parseInt(newLinkData.max_uses) })
            };
            await sharingApi.create(payload);
            setIsCreating(false);
            setNewLinkData({ access_level: 'READ', expires_at: '', password: '', max_uses: '' });
            fetchLinks();
        } catch (error) {
            console.error('Failed to create share link:', error);
        }
    };

    const handleRevokeLink = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this link? It will no longer be accessible.')) return;
        try {
            await sharingApi.revoke(id);
            fetchLinks();
        } catch (error) {
            console.error('Failed to revoke link:', error);
        }
    };

    const copyToClipboard = (token) => {
        const url = `${window.location.origin}/shared/${token}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Share Notebook</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {/* Create New Link Section */}
                    <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Create New Link</h3>
                            {!isCreating && (
                                <Button size="sm" onClick={() => setIsCreating(true)} className="flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> New Link
                                </Button>
                            )}
                        </div>

                        {isCreating && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Access Level</label>
                                        <select
                                            value={newLinkData.access_level}
                                            onChange={(e) => setNewLinkData({ ...newLinkData, access_level: e.target.value })}
                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="READ">Read Only</option>
                                            <option value="EDIT">Can Edit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Expiration (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={newLinkData.expires_at}
                                            onChange={(e) => setNewLinkData({ ...newLinkData, expires_at: e.target.value })}
                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Password (Optional)</label>
                                        <input
                                            type="password"
                                            value={newLinkData.password}
                                            onChange={(e) => setNewLinkData({ ...newLinkData, password: e.target.value })}
                                            placeholder="Set a password"
                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Max Uses (Optional)</label>
                                        <input
                                            type="number"
                                            value={newLinkData.max_uses}
                                            onChange={(e) => setNewLinkData({ ...newLinkData, max_uses: e.target.value })}
                                            placeholder="No limit"
                                            className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="secondary" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button size="sm" onClick={handleCreateLink}>Create Link</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Existing Links List */}
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Links</h3>
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                    ) : links.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No active share links.</p>
                    ) : (
                        <div className="space-y-3">
                            {links.map(link => (
                                <div key={link.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Globe className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-900">{link.access_level} Access</span>
                                            {link.password_hash && <Lock className="w-3 h-3 text-gray-400" title="Password Protected" />}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-3">
                                            <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                                            {link.expires_at && (
                                                <span className="flex items-center gap-1 text-orange-600">
                                                    <Clock className="w-3 h-3" />
                                                    Expires {new Date(link.expires_at).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span>{link.use_count} views</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(link.token)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Copy Link"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRevokeLink(link.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Revoke Link"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
