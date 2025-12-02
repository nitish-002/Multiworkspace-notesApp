import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, FileText, AlertCircle, Save, Cloud, CloudOff } from 'lucide-react';
import { sharingApi } from '../api/axios';
import Button from '../components/ui/Button';

const SharedNotebook = () => {
    const { token } = useParams();
    const [notebook, setNotebook] = useState(null);
    const [accessLevel, setAccessLevel] = useState('READ');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordRequired, setIsPasswordRequired] = useState(false);

    // Editing state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        fetchNotebook();
    }, [token]);

    const fetchNotebook = async (pwd = null) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await sharingApi.access(token, pwd);
            const { notebook: nbData, access_level } = response.data;

            setNotebook(nbData);
            setAccessLevel(access_level);
            setTitle(nbData.title);
            setContent(nbData.content);
            setLastSaved(new Date(nbData.updated_at));
            setIsPasswordRequired(false);
        } catch (err) {
            console.error('Failed to access shared notebook:', err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                // Check if it's a password issue
                if (err.response.data?.detail?.toLowerCase().includes('password')) {
                    setIsPasswordRequired(true);
                    setError('This notebook is password protected.');
                } else {
                    setError(err.response.data?.detail || 'Access denied.');
                }
            } else {
                setError('Failed to load notebook. The link may be invalid or expired.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        fetchNotebook(password);
    };

    const handleSave = async () => {
        if (accessLevel !== 'EDIT') return;
        setIsSaving(true);
        try {
            const response = await sharingApi.edit(token, { title, content }, password || null);
            setNotebook(response.data);
            setLastSaved(new Date(response.data.updated_at));
        } catch (err) {
            console.error('Failed to save notebook:', err);
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save logic for editors
    useEffect(() => {
        if (!notebook || accessLevel !== 'EDIT') return;

        const timeoutId = setTimeout(() => {
            if (title !== notebook.title || content !== notebook.content) {
                handleSave();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, content, notebook, accessLevel]);

    if (isLoading && !isPasswordRequired) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isPasswordRequired) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Password Protected</h2>
                    <p className="text-gray-500 mb-6">Please enter the password to view this notebook.</p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">Access Notebook</Button>
                    </form>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Error</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!notebook) return null;

    const canEdit = accessLevel === 'EDIT';

    return (
        <div className="min-h-screen bg-white">
            <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900">{notebook.title}</h1>
                        <p className="text-xs text-gray-500">
                            Shared View • {canEdit ? 'Can Edit' : 'Read Only'}
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-400 hidden sm:block">
                            {isSaving ? (
                                <span className="flex items-center gap-1 text-gray-500">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Cloud className="w-4 h-4" />
                                    Saved {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                    </div>
                )}
            </header>

            <main className="max-w-4xl mx-auto w-full p-8 md:p-12">
                {canEdit ? (
                    <>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled"
                            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent mb-8"
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type '/' for commands"
                            className="w-full h-[calc(100vh-250px)] resize-none text-lg text-gray-700 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent leading-relaxed"
                        />
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-bold text-gray-900 mb-8">{notebook.title}</h1>
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {notebook.content || <span className="text-gray-400 italic">Empty notebook</span>}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default SharedNotebook;
