import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Cloud, CloudOff } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';

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

    // Fetch notebook details
    useEffect(() => {
        const fetchNotebook = async () => {
            try {
                const response = await api.get(`/api/notebooks/${id}/`);
                const data = response.data;
                setNotebook(data);
                setTitle(data.title);
                setContent(data.content);
                setLastSaved(new Date(data.updated_at));

                // Determine if user can edit (Owner/Editor)
                // This logic might need adjustment based on how the API returns permissions
                // For now, we assume if the request succeeded, we have access. 
                // We should ideally check the user's role in the workspace.
                // A simple check: if the API allows PUT, we can edit.
                setCanEdit(true);
            } catch (err) {
                console.error('Failed to fetch notebook:', err);
                setError('Failed to load notebook.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotebook();
    }, [id]);

    // Shared save function
    const saveNotebook = async () => {
        setIsSaving(true);
        try {
            const response = await api.patch(`/api/notebooks/${id}/`, {
                title,
                content
            });
            setNotebook(response.data);
            setLastSaved(new Date(response.data.updated_at));
            setError('');
        } catch (err) {
            console.error('Failed to save notebook:', err);
            setError('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    // Manual save handler
    const handleManualSave = async () => {
        if (isSaving) return;
        await saveNotebook();
    };

    // Auto-save logic
    useEffect(() => {
        if (!notebook || !canEdit) return;

        const timeoutId = setTimeout(() => {
            if (title !== notebook.title || content !== notebook.content) {
                saveNotebook();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, content, id, notebook, canEdit]);

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
                    <div className="text-sm text-gray-500 truncate max-w-[300px]">
                        {notebook?.workspace_name || 'Workspace'} / <span className="text-gray-900 font-medium">{title || 'Untitled'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400 hidden sm:block">
                        {isSaving ? (
                            <span className="flex items-center gap-1 text-gray-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                                Saving...
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

                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleManualSave}
                        disabled={isSaving || !canEdit}
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
        </div>
    );
};

export default NotebookDetail;
