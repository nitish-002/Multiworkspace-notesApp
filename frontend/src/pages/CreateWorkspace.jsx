import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const CreateWorkspace = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/api/workspaces/', formData);
            // Redirect to the new workspace (or home for now)
            navigate('/');
        } catch (err) {
            console.error('Create workspace error:', err);
            setError(err.response?.data?.detail || 'Failed to create workspace. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create a new workspace</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Workspaces are where you organize your notes and collaborate with your team.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <Input
                    label="Workspace Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Acme Corp Engineering"
                    autoFocus
                />

                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                        transition duration-200 ease-in-out"
                        placeholder="A space for engineering team notes and docs..."
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        Create Workspace
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateWorkspace;
