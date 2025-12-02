import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../api/axios';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ notebooks: [], workspaces: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setResults({ notebooks: [], workspaces: [] });
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const [notebooksRes, workspacesRes] = await Promise.all([
                searchApi.notebooks(query),
                searchApi.workspaces(query)
            ]);
            setResults({
                notebooks: notebooksRes.data.results || notebooksRes.data,
                workspaces: workspacesRes.data.results || workspacesRes.data
            });
            setIsOpen(true);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search notebooks & workspaces..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsOpen(true)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {isOpen && (results.notebooks.length > 0 || results.workspaces.length > 0) && (
                <div className="absolute mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50">
                    {results.workspaces.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                Workspaces
                            </div>
                            {results.workspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    onClick={() => handleNavigate(`/workspace/${workspace.id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                                >
                                    <span className="font-medium text-gray-900">{workspace.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.notebooks.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                                Notebooks
                            </div>
                            {results.notebooks.map((notebook) => (
                                <button
                                    key={notebook.id}
                                    onClick={() => handleNavigate(`/notebook/${notebook.id}`)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    <div className="font-medium text-gray-900">{notebook.title}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {notebook.workspace.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isOpen && query.trim() && !loading && results.notebooks.length === 0 && results.workspaces.length === 0 && (
                <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-sm text-gray-500 ring-1 ring-black ring-opacity-5 z-50">
                    No results found.
                </div>
            )}
        </div>
    );
};

export default SearchBar;
