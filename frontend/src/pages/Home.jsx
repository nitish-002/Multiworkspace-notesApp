import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Layout as LayoutIcon } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';

const Home = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const response = await api.get('/api/workspaces/');
            // Handle paginated response
            const data = response.data.results || response.data;
            setWorkspaces(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Select a workspace to get started
                    </p>
                </div>
                <Link to="/create-workspace">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Workspace
                    </Button>
                </Link>
            </div>

            {workspaces.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <LayoutIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No workspaces yet</h3>
                    <p className="mt-1 text-sm text-gray-500 mb-6">
                        Create your first workspace to start organizing your notes.
                    </p>
                    <Link to="/create-workspace">
                        <Button variant="secondary">
                            Create Workspace
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((workspace) => (
                        <Link
                            key={workspace.id}
                            to={`/workspace/${workspace.id}`}
                            className="group block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors">
                                    <span className="font-semibold text-lg">
                                        {workspace.name[0].toUpperCase()}
                                    </span>
                                </div>
                                {workspace.my_role === 'OWNER' && (
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        Owner
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {workspace.name}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                {workspace.description || "No description provided."}
                            </p>

                            <div className="flex items-center text-xs text-gray-500 gap-4">
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{workspace.member_count} members</span>
                                </div>
                                {/* Add notebook count if available in API response */}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
