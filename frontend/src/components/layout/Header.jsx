import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Plus, ChevronDown, LayoutGrid } from 'lucide-react';
import api from '../../api/axios';
import SearchBar from '../search/SearchBar';

const Header = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [user, setUser] = useState(null);

    const profileRef = useRef(null);
    const workspacesRef = useRef(null);

    useEffect(() => {
        fetchWorkspaces();
        fetchProfile();

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (workspacesRef.current && !workspacesRef.current.contains(event.target)) {
                setIsWorkspacesOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const response = await api.get('/api/workspaces/');
            // Handle paginated response
            const data = response.data.results || response.data;
            setWorkspaces(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/auth/profile/');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const myWorkspaces = workspaces.filter(ws => ws.my_role === 'OWNER');
    const sharedWorkspaces = workspaces.filter(ws => ws.my_role !== 'OWNER');

    return (
        <header className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4 w-1/4">
                <Link to="/" className="font-semibold text-lg flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    <span>PaceWorks</span>
                </Link>

                <div className="relative" ref={workspacesRef}>
                    <button
                        onClick={() => setIsWorkspacesOpen(!isWorkspacesOpen)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    >
                        Workspaces
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {isWorkspacesOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">My Workspaces</div>
                            {myWorkspaces.length > 0 ? (
                                myWorkspaces.map(ws => (
                                    <Link
                                        key={ws.id}
                                        to={`/workspace/${ws.id}`}
                                        className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsWorkspacesOpen(false)}
                                    >
                                        {ws.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="px-3 py-1.5 text-sm text-gray-400 italic">No workspaces found</div>
                            )}

                            <div className="border-t border-gray-100 my-2"></div>

                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">Shared with me</div>
                            {sharedWorkspaces.length > 0 ? (
                                sharedWorkspaces.map(ws => (
                                    <Link
                                        key={ws.id}
                                        to={`/workspace/${ws.id}`}
                                        className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsWorkspacesOpen(false)}
                                    >
                                        {ws.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="px-3 py-1.5 text-sm text-gray-400 italic">No shared workspaces</div>
                            )}

                            <div className="border-t border-gray-100 my-2"></div>

                            <Link
                                to="/create-workspace"
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                                onClick={() => setIsWorkspacesOpen(false)}
                            >
                                <Plus className="w-4 h-4" />
                                Create Workspace
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-xl px-4">
                <SearchBar />
            </div>

            <div className="relative flex justify-end w-1/4" ref={profileRef}>
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <span className="text-sm text-gray-700">{user?.email}</span>
                </button>

                {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
