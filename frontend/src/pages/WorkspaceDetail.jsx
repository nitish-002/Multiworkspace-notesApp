import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Settings, FileText, MoreVertical } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import CreateNotebookModal from '../components/workspaces/CreateNotebookModal';
import InviteMemberModal from '../components/workspaces/InviteMemberModal';
import LabelList from '../components/labels/LabelList';

const WorkspaceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [notebooks, setNotebooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [wsRes, nbRes, memRes] = await Promise.all([
                api.get(`/api/workspaces/${id}/`),
                api.get(`/api/notebooks/?workspace_id=${id}`),
                api.get(`/api/workspaces/${id}/members/`)
            ]);

            setWorkspace(wsRes.data);

            // Handle paginated responses
            const nbData = nbRes.data.results || nbRes.data;
            setNotebooks(Array.isArray(nbData) ? nbData : []);

            const memData = memRes.data.results || memRes.data;
            setMembers(Array.isArray(memData) ? memData : []);

        } catch (error) {
            console.error('Failed to fetch workspace data:', error);
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

    if (!workspace) {
        return <div className="text-center py-12">Workspace not found</div>;
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Sidebar / Member List */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 flex flex-col overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 truncate" title={workspace.name}>
                        {workspace.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">{workspace.member_count} members</p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</h3>
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="text-gray-500 hover:text-gray-900"
                            title="Invite Member"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200/50">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                    {member.user.first_name?.[0] || member.user.email?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {member.user.first_name ? `${member.user.first_name} ${member.user.last_name}` : member.user.username}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{member.role.toLowerCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <LabelList workspaceId={id} />
                </div>
            </div>

            {/* Main Content / Notebooks */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Notebooks</h1>
                    <Button onClick={() => setIsNotebookModalOpen(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Notebook
                    </Button>
                </div>

                {notebooks.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No notebooks yet</h3>
                        <p className="mt-1 text-sm text-gray-500 mb-6">
                            Create your first notebook to start documenting.
                        </p>
                        <Button variant="secondary" onClick={() => setIsNotebookModalOpen(true)}>
                            Create Notebook
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notebooks.map(notebook => (
                            <div
                                key={notebook.id}
                                onClick={() => navigate(`/notebook/${notebook.id}`)}
                                className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {notebook.title}
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                    {(notebook.content || '').substring(0, 100)}...
                                </p>

                                <div className="text-xs text-gray-400">
                                    Updated {new Date(notebook.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateNotebookModal
                isOpen={isNotebookModalOpen}
                onClose={() => setIsNotebookModalOpen(false)}
                workspaceId={id}
                onCreated={fetchData}
            />

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                workspaceId={id}
                onInvited={fetchData}
            />
        </div >
    );
};

export default WorkspaceDetail;
