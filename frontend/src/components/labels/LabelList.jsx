import React, { useState, useEffect } from 'react';
import { labelsApi } from '../../api/axios';
import LabelBadge from './LabelBadge';

const LabelList = ({ workspaceId }) => {
    const [labels, setLabels] = useState([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3B82F6'); // Default blue
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLabels();
    }, [workspaceId]);

    const fetchLabels = async () => {
        try {
            setLoading(true);
            const response = await labelsApi.list(workspaceId);
            const data = response.data.results || response.data;
            setLabels(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch labels", err);
            setError("Failed to load labels");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLabel = async (e) => {
        e.preventDefault();
        if (!newLabelName.trim()) return;

        try {
            const response = await labelsApi.create({
                name: newLabelName,
                color: newLabelColor,
                workspace: workspaceId
            });
            setLabels([...labels, response.data]);
            setNewLabelName('');
            setNewLabelColor('#3B82F6');
        } catch (err) {
            console.error("Failed to create label", err);
            setError("Failed to create label");
        }
    };

    const handleDeleteLabel = async (id) => {
        if (!window.confirm("Are you sure you want to delete this label?")) return;
        try {
            await labelsApi.delete(id);
            setLabels(labels.filter(l => l.id !== id));
        } catch (err) {
            console.error("Failed to delete label", err);
            setError("Failed to delete label");
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading labels...</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Workspace Labels</h3>

            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

            <div className="flex flex-wrap mb-4">
                {labels.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No labels created yet.</p>
                ) : (
                    labels.map(label => (
                        <LabelBadge
                            key={label.id}
                            label={label}
                            onDelete={() => handleDeleteLabel(label.id)}
                        />
                    ))
                )}
            </div>

            <form onSubmit={handleCreateLabel} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="New label name"
                    className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="h-8 w-8 p-0 border-0 rounded-md cursor-pointer"
                    title="Choose label color"
                />
                <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add
                </button>
            </form>
        </div>
    );
};

export default LabelList;
