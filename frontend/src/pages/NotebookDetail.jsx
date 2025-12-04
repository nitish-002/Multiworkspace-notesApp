import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Cloud, CloudOff, Share2, AlertTriangle, Bell, Clock } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import NotebookLabels from '../components/labels/NotebookLabels';
import ShareModal from '../components/sharing/ShareModal';
import SyncManager from '../services/SyncManager';
import ConflictResolver from '../components/sync/ConflictResolver';
import ConflictListModal from '../components/sync/ConflictListModal';

const NotebookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notebook, setNotebook] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState('');
    const [canEdit, setCanEdit] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Sync State
    const syncManagerRef = useRef(null);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error, conflict, conflict_pending
    const [conflict, setConflict] = useState(null);
    const [canResolveConflict, setCanResolveConflict] = useState(false);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

    // Centralized Conflict Management
    const [pendingConflictCount, setPendingConflictCount] = useState(0);
    const [isConflictListOpen, setIsConflictListOpen] = useState(false);

    // Initialize SyncManager
    useEffect(() => {
        syncManagerRef.current = new SyncManager(id);
        return () => {
            syncManagerRef.current = null;
        };
    }, [id]);

    // Fetch notebook details and start session
    useEffect(() => {
        const fetchNotebookAndStartSession = async () => {
            try {
                // 1. Fetch Notebook
                const response = await api.get(`/api/notebooks/${id}/`);
                const data = response.data;
                setNotebook(data);
                setTitle(data.title);
                setContent(data.content);
                setLastSaved(new Date(data.updated_at));

                // Determine permissions
                // Temporary: Check if current user is the owner of the workspace
                const profileRes = await api.get('/api/auth/profile/');
                const currentUser = profileRes.data;

                // Fetch workspace details to check role
                const workspaceRes = await api.get(`/api/workspaces/${data.workspace}/`);
                const workspace = workspaceRes.data;

                const member = workspace.members.find(m => m.user.id === currentUser.id);
                const role = member ? member.role : null;

                const hasEditPermission = role === 'OWNER' || role === 'ADMIN' || role === 'EDITOR';
                const hasResolvePermission = role === 'OWNER' || role === 'ADMIN';

                setCanEdit(hasEditPermission);
                setCanResolveConflict(hasResolvePermission);

                // 2. Start Sync Session if editable
                if (hasEditPermission) {
                    await syncManagerRef.current.startSession();
                }

            } catch (err) {
                console.error('Failed to load notebook:', err);
                setError('Failed to load notebook.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotebookAndStartSession();
    }, [id]);

    // Sync Function
    const performSync = useCallback(async (currentContent) => {
        if (!syncManagerRef.current || !canEdit) return;

        setSyncStatus('syncing');
        setIsSaving(true);
        setError('');

        try {
            const result = await syncManagerRef.current.sync(currentContent);

            if (result) {
                if (result.status === 'success') {
                    setLastSaved(new Date());
                    setSyncStatus('idle');
                } else if (result.status === 'auto_merged') {
                    setContent(result.content); // Update editor with merged content
                    setLastSaved(new Date());
                    setSyncStatus('idle');
                } else if (result.status === 'conflict') {
                    // This should theoretically not happen for Editors anymore (queued)
                    // But might happen for Owners if auto-merge fails completely
                    setSyncStatus('conflict');
                    setConflict(result);
                    setIsConflictModalOpen(true);
                } else if (result.status === 'conflict_pending') {
                    setSyncStatus('conflict_pending');
                } else if (result.status === 'no_changes') {
                    setSyncStatus('idle');
                }
            } else {
                setSyncStatus('idle');
            }
        } catch (err) {
            console.error('Sync error:', err);
            setSyncStatus('error');
            setError('Failed to sync changes.');
        } finally {
            setIsSaving(false);
        }
    }, [canEdit]);

    // Auto-save / Auto-sync logic (Polling included)
    useEffect(() => {
        if (!notebook || !canEdit || syncStatus === 'conflict') return;

        // Debounced save for user edits
        const timeoutId = setTimeout(() => {
            if (content !== syncManagerRef.current.baseContent) {
                performSync(content);
            }
            if (title !== notebook.title) {
                // Save title via standard API
                api.patch(`/api/notebooks/${id}/`, { title })
                    .then(res => setNotebook(prev => ({ ...prev, title: res.data.title })))
                    .catch(err => console.error("Title save failed", err));
            }
        }, 1000);

        // Polling for updates from other users (every 3 seconds)
        const intervalId = setInterval(async () => {
            // Only poll if we are not currently syncing/saving and no conflict
            if (syncStatus === 'idle' && !isSaving && syncManagerRef.current) {
                // Check if checkVersion exists (handles stale HMR instances)
                if (typeof syncManagerRef.current.checkVersion === 'function') {
                    try {
                        const res = await api.get(`/api/sync/notebooks/${id}/check-version/`);
                        const { version, pending_conflicts } = res.data;

                        setPendingConflictCount(pending_conflicts || 0);

                        // If server version is greater than our base version, pull changes
                        if (version && version > syncManagerRef.current.baseVersion) {
                            console.log('New version detected, pulling changes...');
                            performSync(content);
                        }
                    } catch (e) {
                        console.error("Polling failed", e);
                    }
                }
            }
        }, 3000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [content, title, id, notebook, canEdit, performSync, syncStatus, isSaving]);

    const handleResolveConflict = async (strategy, finalContent) => {
        if (!conflict) return;

        try {
            const result = await syncManagerRef.current.resolveConflict(conflict.conflict_id || conflict.id, strategy, finalContent);
            if (result && result.status === 'resolved') {
                setConflict(null);
                setSyncStatus('idle');
                setIsConflictModalOpen(false);

                // Refresh content
                const response = await api.get(`/api/notebooks/${id}/`);
                setContent(response.data.content);
                await syncManagerRef.current.startSession();

                // Also refresh conflict list if open
                if (isConflictListOpen) {
                    setIsConflictListOpen(false);
                }
            }
        } catch (err) {
            console.error('Resolution failed:', err);
            alert('Failed to resolve conflict.');
        }
    };

    const handleSelectConflict = async (selectedConflict) => {
        // Fetch full conflict details including content
        try {
            const response = await api.get(`/api/sync/conflicts/${selectedConflict.id}/`);
            const fullConflict = response.data;

            // Transform to format expected by ConflictResolver
            setConflict({
                ...fullConflict,
                conflict_id: fullConflict.id
            });
            setIsConflictListOpen(false);
            setIsConflictModalOpen(true);
        } catch (err) {
            console.error("Failed to load conflict details", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !notebook) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Bar */}
            <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <div className="flex flex-col">
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">
                            {notebook?.workspace_name || 'Workspace'} / <span className="text-gray-900 font-medium">{title || 'Untitled'}</span>
                        </div>
                        {notebook && <NotebookLabels notebookId={notebook.id} workspaceId={notebook.workspace} />}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:block">
                        {syncStatus === 'syncing' || isSaving ? (
                            <span className="flex items-center gap-1 text-gray-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                                Saving...
                            </span>
                        ) : syncStatus === 'conflict' ? (
                            <span
                                className="flex items-center gap-1 text-red-600 font-medium cursor-pointer hover:underline"
                                onClick={() => setIsConflictModalOpen(true)}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Conflict Detected
                            </span>
                        ) : syncStatus === 'conflict_pending' ? (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                <Clock className="w-4 h-4" />
                                Changes Queued
                            </span>
                        ) : error ? (
                            <span className="flex items-center gap-1 text-red-500">
                                <CloudOff className="w-4 h-4" />
                                Save failed
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Cloud className="w-4 h-4" />
                                Saved {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>

                    {canResolveConflict && (
                        <Button
                            size="sm"
                            variant={pendingConflictCount > 0 ? "primary" : "secondary"}
                            onClick={() => setIsConflictListOpen(true)}
                            className="flex items-center gap-2 relative"
                        >
                            <Bell className="w-4 h-4" />
                            Conflicts
                            {pendingConflictCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {pendingConflictCount}
                                </span>
                            )}
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>

                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => performSync(content)}
                        disabled={isSaving || !canEdit || syncStatus === 'conflict'}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </Button>
                </div>
            </header>

            {/* Editor Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-12">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled"
                    className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent mb-8"
                    readOnly={!canEdit}
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type '/' for commands"
                    className="w-full h-[calc(100vh-250px)] resize-none text-lg text-gray-700 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent leading-relaxed"
                    readOnly={!canEdit}
                />
            </main>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                notebookId={id}
            />

            <ConflictListModal
                notebookId={id}
                isOpen={isConflictListOpen}
                onClose={() => setIsConflictListOpen(false)}
                onSelectConflict={handleSelectConflict}
            />

            {conflict && isConflictModalOpen && (
                <ConflictResolver
                    conflict={conflict}
                    onResolve={handleResolveConflict}
                    onCancel={() => setIsConflictModalOpen(false)}
                    canResolve={canResolveConflict}
                />
            )}
        </div>
    );
};

export default NotebookDetail;
