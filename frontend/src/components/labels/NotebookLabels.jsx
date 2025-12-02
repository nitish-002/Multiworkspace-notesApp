import React, { useState, useEffect } from 'react';
import { labelsApi } from '../../api/axios';
import LabelBadge from './LabelBadge';

const NotebookLabels = ({ notebookId, workspaceId }) => {
    const [notebookLabels, setNotebookLabels] = useState([]);
    const [availableLabels, setAvailableLabels] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (notebookId) {
            fetchNotebookLabels();
        }
    }, [notebookId]);

    useEffect(() => {
        if (isAdding && workspaceId) {
            fetchAvailableLabels();
        }
    }, [isAdding, workspaceId]);

    const fetchNotebookLabels = async () => {
        try {
            const response = await labelsApi.listForNotebook(notebookId);
            const data = response.data.results || response.data;
            setNotebookLabels(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch notebook labels", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableLabels = async () => {
        try {
            const response = await labelsApi.list(workspaceId);
            const data = response.data.results || response.data;
            const labelsList = Array.isArray(data) ? data : [];

            // Filter out labels already assigned to the notebook
            const assignedIds = new Set(notebookLabels.map(l => l.id));
            setAvailableLabels(labelsList.filter(l => !assignedIds.has(l.id)));
        } catch (err) {
            console.error("Failed to fetch workspace labels", err);
        }
    };

    const handleAddLabel = async (labelId) => {
        try {
            await labelsApi.addToNotebook(notebookId, labelId);
            const labelToAdd = availableLabels.find(l => l.id === labelId);
            setNotebookLabels([...notebookLabels, labelToAdd]);
            setAvailableLabels(availableLabels.filter(l => l.id !== labelId));
            setIsAdding(false);
        } catch (err) {
            console.error("Failed to add label", err);
        }
    };

    const handleRemoveLabel = async (labelId) => {
        try {
            await labelsApi.removeFromNotebook(notebookId, labelId);
            setNotebookLabels(notebookLabels.filter(l => l.id !== labelId));
        } catch (err) {
            console.error("Failed to remove label", err);
        }
    };

    if (loading) return null;

    return (
        <div className="flex flex-wrap items-center">
            {notebookLabels.map(label => (
                <LabelBadge
                    key={label.id}
                    label={label}
                    onDelete={() => handleRemoveLabel(label.id)}
                />
            ))}

            <div className="relative inline-block text-left mb-2">
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        + Add Label
                    </button>
                ) : (
                    <div className="origin-top-left absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            {availableLabels.length > 0 ? (
                                availableLabels.map(label => (
                                    <button
                                        key={label.id}
                                        onClick={() => handleAddLabel(label.id)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        <span
                                            className="inline-block w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: label.color }}
                                        ></span>
                                        {label.name}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">No labels available</div>
                            )}
                            <button
                                onClick={() => setIsAdding(false)}
                                className="block w-full text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-100 border-t"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotebookLabels;
